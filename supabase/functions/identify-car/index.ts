import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================
// CONSTANTS
// ============================================
const CONFIDENCE_THRESHOLD_HIGH = 0.7;
const CONFIDENCE_THRESHOLD_MEDIUM = 0.4;
const MAX_IMAGE_SIZE_BYTES = 400000; // ~400KB (reduced for performance)
const USE_MOCK_DATA = false;
const VISION_TIMEOUT_MS = 10000; // 10 second hard timeout

const DISCLAIMER = "Results are AI-based estimates. Spot Score reflects perceived uniqueness, not production data.";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// SPOT SCORE CONFIGURATION
// ============================================
// Vehicle categories and their base uniqueness scores
const CATEGORY_SCORES: Record<string, number> = {
  // Ultra-rare
  "hypercar": 95,
  "supercar": 85,
  "exotic": 80,
  
  // Premium/luxury
  "luxury": 65,
  "premium sports": 70,
  "sports": 60,
  
  // Classic/special
  "classic": 75,
  "vintage": 80,
  "limited edition": 85,
  
  // Standard categories
  "suv": 30,
  "sedan": 25,
  "truck": 35,
  "hatchback": 25,
  "wagon": 35,
  "van": 30,
  "minivan": 25,
  "crossover": 28,
  "coupe": 40,
  "convertible": 50,
  
  // Motorcycles (generally higher)
  "sportbike": 55,
  "cruiser": 50,
  "touring": 45,
  "naked": 50,
  "adventure": 55,
  "cafe racer": 65,
  "bobber": 60,
  "chopper": 70,
  "dirt bike": 45,
  "scooter": 30,
  "custom": 75,
  
  // Default
  "unknown": 40,
};

// Make modifiers (add/subtract from base score)
const MAKE_MODIFIERS: Record<string, number> = {
  // Ultra-rare makes
  "bugatti": 30,
  "pagani": 30,
  "koenigsegg": 30,
  "rimac": 28,
  
  // Supercars
  "ferrari": 25,
  "lamborghini": 25,
  "mclaren": 22,
  "aston martin": 18,
  
  // Luxury
  "rolls-royce": 20,
  "bentley": 18,
  "maybach": 18,
  
  // Premium sports
  "porsche": 12,
  "maserati": 15,
  "lotus": 18,
  "alfa romeo": 10,
  
  // Premium
  "mercedes-benz": 5,
  "mercedes": 5,
  "bmw": 5,
  "audi": 4,
  "lexus": 4,
  "jaguar": 8,
  
  // Electric premium
  "tesla": 6,
  "lucid": 15,
  "rivian": 12,
  
  // American muscle
  "dodge": 5,
  
  // Motorcycle premium
  "ducati": 15,
  "mv agusta": 20,
  "bimota": 25,
  "indian": 10,
  "harley-davidson": 8,
  "triumph": 8,
  "bmw motorrad": 8,
  "aprilia": 10,
  "ktm": 8,
  
  // Standard makes (slight negative)
  "toyota": -5,
  "honda": -5,
  "ford": -3,
  "chevrolet": -3,
  "nissan": -4,
  "hyundai": -5,
  "kia": -5,
  "volkswagen": -2,
  "subaru": 0,
  "mazda": 0,
};

// Common model penalty (very common models get score reduction)
const COMMON_MODELS = new Set([
  "camry", "corolla", "civic", "accord", "rav4", "cr-v", "f-150", 
  "silverado", "altima", "sentra", "elantra", "sonata", "tucson",
  "rogue", "escape", "explorer", "equinox", "malibu", "impala",
  "model 3", "model y", "3 series", "5 series", "a4", "q5"
]);

// ============================================
// TYPES
// ============================================
type VehicleType = "car" | "motorcycle" | "unknown";

interface VehicleIdentificationRequest {
  image: string; // base64-encoded JPEG
}

interface VehicleIdentificationResponse {
  vehicleType: VehicleType;
  make: string | null;
  model: string | null;
  year: number | null;
  spotScore: number | null;
  similarModels: string[] | null;
  confidenceScore: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  disclaimer: string;
  identifiedAt: string;
}

interface ErrorResponse {
  error: string;
  code: string;
}

interface MockedVehicle {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number | null;
  category: string;
  confidenceScore: number;
}

// OpenAI Vision response structure from tool call
interface VisionAnalysisResult {
  vehicleType: "car" | "motorcycle" | "unknown";
  make: string | null;
  model: string | null;
  year: number | null;
  category: string | null;
  confidenceScore: number; // 0-100
  similarModels: string[] | null;
  reasoning: string;
}

// ============================================
// MOCKED DATA (fallback)
// ============================================
const MOCKED_VEHICLES: MockedVehicle[] = [
  { vehicleType: "car", make: "Honda", model: "Civic", year: null, category: "sedan", confidenceScore: 85 },
  { vehicleType: "car", make: "Ford", model: "Mustang", year: null, category: "sports", confidenceScore: 72 },
  { vehicleType: "car", make: "Porsche", model: "911", year: null, category: "sports", confidenceScore: 68 },
  { vehicleType: "motorcycle", make: "Harley-Davidson", model: "Sportster", year: null, category: "cruiser", confidenceScore: 78 },
  { vehicleType: "motorcycle", make: "Ducati", model: "Panigale", year: null, category: "sportbike", confidenceScore: 71 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getConfidenceLabel(score: number): "high" | "medium" | "low" {
  if (score >= CONFIDENCE_THRESHOLD_HIGH * 100) return "high";
  if (score >= CONFIDENCE_THRESHOLD_MEDIUM * 100) return "medium";
  return "low";
}

function validateRequest(body: unknown): { valid: true; data: VehicleIdentificationRequest } | { valid: false; error: ErrorResponse } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: { error: "Invalid request body", code: "INVALID_BODY" } };
  }

  const { image } = body as Record<string, unknown>;

  if (!image || typeof image !== "string") {
    return { valid: false, error: { error: "Missing or invalid 'image' field", code: "MISSING_IMAGE" } };
  }

  // Log image size for monitoring (no rejection - client compresses)
  const estimatedBytes = (image.length * 3) / 4;
  console.log(`[identify-car] Image payload: ${Math.round(estimatedBytes / 1024)}KB`);

  return { valid: true, data: { image } };
}

/**
 * Calculate Spot Score based on vehicle attributes
 * 
 * Inputs:
 * - vehicleType: motorcycles get a base boost
 * - category: determines base score
 * - make: applies modifier
 * - model: common models get penalty
 * - confidenceScore: low confidence reduces score slightly
 */
function calculateSpotScore(
  vehicleType: VehicleType,
  make: string | null,
  model: string | null,
  category: string | null,
  confidenceScore: number
): number | null {
  // Cannot calculate without identification
  if (vehicleType === "unknown" || confidenceScore < 60) {
    return null;
  }

  // Start with category base score
  const normalizedCategory = (category || "unknown").toLowerCase();
  let score = CATEGORY_SCORES[normalizedCategory] ?? CATEGORY_SCORES["unknown"];

  // Motorcycles get inherent boost (they're less common to spot)
  if (vehicleType === "motorcycle") {
    score += 10;
  }

  // Apply make modifier
  if (make) {
    const normalizedMake = make.toLowerCase();
    const makeModifier = MAKE_MODIFIERS[normalizedMake] ?? 0;
    score += makeModifier;
  }

  // Apply common model penalty
  if (model) {
    const normalizedModel = model.toLowerCase();
    // Check if model contains any common model name
    for (const common of COMMON_MODELS) {
      if (normalizedModel.includes(common)) {
        score -= 10;
        break;
      }
    }
  }

  // Confidence adjustment: lower confidence slightly reduces score
  if (confidenceScore < 70) {
    score -= 5;
  } else if (confidenceScore < 80) {
    score -= 2;
  }

  // Clamp to 0-100
  return Math.round(Math.max(0, Math.min(100, score)));
}

function getMockedResponse(): VehicleIdentificationResponse {
  const randomIndex = Math.floor(Math.random() * MOCKED_VEHICLES.length);
  const vehicle = MOCKED_VEHICLES[randomIndex];

  const spotScore = calculateSpotScore(
    vehicle.vehicleType,
    vehicle.make,
    vehicle.model,
    vehicle.category,
    vehicle.confidenceScore
  );

  return {
    vehicleType: vehicle.vehicleType,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    spotScore: spotScore,
    similarModels: null,
    confidenceScore: vehicle.confidenceScore,
    confidence: getConfidenceLabel(vehicle.confidenceScore),
    reasoning: `Mocked response for testing: ${vehicle.make} ${vehicle.model}`,
    disclaimer: DISCLAIMER,
    identifiedAt: new Date().toISOString(),
  };
}

/**
 * Call OpenAI Vision API via Lovable AI Gateway with minimal prompt for speed
 */
async function callOpenAIVision(imageBase64: string, apiKey: string): Promise<VisionAnalysisResult> {
  // MINIMAL prompt for speed
  const systemPrompt = `Identify vehicles in images. Return JSON only.
Rules:
- vehicleType: "car", "motorcycle", or "unknown"
- confidenceScore: 0-100 integer
- If confidence < 60: make=null, model=null
- If confidence < 75: model=null
- category: sedan/suv/truck/coupe/sportbike/cruiser/etc.
- No explanations, JSON only.`;

  const tools = [
    {
      type: "function",
      function: {
        name: "identify_vehicle",
        description: "Return vehicle identification",
        parameters: {
          type: "object",
          properties: {
            vehicleType: { type: "string", enum: ["car", "motorcycle", "unknown"] },
            make: { type: ["string", "null"] },
            model: { type: ["string", "null"] },
            year: { type: ["integer", "null"] },
            category: { type: ["string", "null"] },
            confidenceScore: { type: "integer", minimum: 0, maximum: 100 },
            similarModels: { type: ["array", "null"], items: { type: "string" } },
            reasoning: { type: "string" }
          },
          required: ["vehicleType", "make", "model", "year", "category", "confidenceScore", "similarModels", "reasoning"],
          additionalProperties: false
        }
      }
    }
  ];

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast + good vision
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify vehicle." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: "identify_vehicle" } },
        max_tokens: 300
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      console.error(`[identify-car] Vision API error: ${status}`);
      throw new Error(`Vision API error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "identify_vehicle") {
      throw new Error("Invalid response from Vision API");
    }

    const result = JSON.parse(toolCall.function.arguments) as VisionAnalysisResult;
    
    // Clamp confidence
    result.confidenceScore = Math.round(Math.max(0, Math.min(100, result.confidenceScore)));
    
    console.log(`[identify-car] Result: type=${result.vehicleType}, make=${result.make}, model=${result.model}, confidence=${result.confidenceScore}`);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      console.error(`[identify-car] Vision API timeout after ${VISION_TIMEOUT_MS}ms`);
      throw new Error("Scan timed out");
    }
    throw e;
  }
}

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log(`[identify-car] Request received`);

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", code: "INVALID_JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      console.log(`[identify-car] Validation failed | code: ${validation.error.code}`);
      return new Response(
        JSON.stringify(validation.error),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Feature flag: use mocked data
    if (USE_MOCK_DATA) {
      const mockResponse = getMockedResponse();
      console.log(`[identify-car] Using mocked response: ${mockResponse.make} ${mockResponse.model}`);
      return new Response(
        JSON.stringify(mockResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API key - REQUIRED for real Vision calls
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[identify-car] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "Vision service not configured", code: "SERVICE_UNAVAILABLE" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call OpenAI Vision API - NO fallback to mock
    let visionResult: VisionAnalysisResult;
    try {
      visionResult = await callOpenAIVision(validation.data.image, apiKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[identify-car] [VISION_API_ERROR] Vision API call failed | error: ${errorMessage}`);
      
      // Return real error - no mock fallback
      return new Response(
        JSON.stringify({ error: errorMessage, code: "VISION_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process vision result with confidence threshold enforcement
    const { vehicleType, make, model, year, category, confidenceScore, reasoning, similarModels } = visionResult;

    // If no vehicle detected or unknown type
    if (vehicleType === "unknown") {
      const clampedConfidence = Math.min(confidenceScore, 50);
      const response: VehicleIdentificationResponse = {
        vehicleType: "unknown",
        make: null,
        model: null,
        year: null,
        spotScore: null,
        similarModels: null,
        confidenceScore: clampedConfidence,
        confidence: "low",
        reasoning: reasoning || "No car or motorcycle detected in the image.",
        disclaimer: DISCLAIMER,
        identifiedAt: new Date().toISOString(),
      };
      
      console.log(`[identify-car] Result: unknown vehicle, confidence=${response.confidenceScore}`);
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply confidence thresholds (60 for make, 75 for model)
    const makeThreshold = 60;
    const modelThreshold = 75;
    
    const meetsMakeThreshold = confidenceScore >= makeThreshold;
    const meetsModelThreshold = confidenceScore >= modelThreshold;

    // Enforce thresholds
    const finalMake = meetsMakeThreshold ? make : null;
    const finalModel = meetsModelThreshold ? model : null;
    const finalYear = meetsMakeThreshold ? year : null;

    // Handle low confidence case
    if (!meetsMakeThreshold || !finalMake) {
      const response: VehicleIdentificationResponse = {
        vehicleType: vehicleType,
        make: null,
        model: null,
        year: null,
        spotScore: null,
        similarModels: null,
        confidenceScore: confidenceScore,
        confidence: "low",
        reasoning: reasoning || `Detected a ${vehicleType} but could not confidently identify make/model.`,
        disclaimer: DISCLAIMER,
        identifiedAt: new Date().toISOString(),
      };
      
      console.log(`[identify-car] Result: ${vehicleType} detected, low confidence (${confidenceScore}%)`);
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate Spot Score
    const spotScore = calculateSpotScore(vehicleType, finalMake, finalModel, category, confidenceScore);

    // Determine similarModels - only when model is null but make is known
    const finalSimilarModels = (finalModel === null && finalMake !== null && confidenceScore >= 60) 
      ? similarModels 
      : null;
    
    const response: VehicleIdentificationResponse = {
      vehicleType: vehicleType,
      make: finalMake,
      model: finalModel,
      year: finalYear,
      spotScore: spotScore,
      similarModels: finalSimilarModels,
      confidenceScore: confidenceScore,
      confidence: getConfidenceLabel(confidenceScore),
      reasoning: reasoning,
      disclaimer: DISCLAIMER,
      identifiedAt: new Date().toISOString(),
    };
    
    console.log(`[identify-car] Result: ${finalMake} ${finalModel} (${vehicleType}), confidence=${confidenceScore}%, spotScore=${spotScore}, category=${category}, similarModels=${finalSimilarModels?.join(', ') || 'none'}`);
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[identify-car] [UNHANDLED_ERROR] ${errorMessage}`);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
