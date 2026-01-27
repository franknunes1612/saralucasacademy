import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================
// CONSTANTS
// ============================================
const CONFIDENCE_THRESHOLD_HIGH = 0.7;
const CONFIDENCE_THRESHOLD_MEDIUM = 0.4;
const USE_MOCK_DATA = false;
const VISION_TIMEOUT_MS = 15000; // 15 second timeout for food analysis

const DISCLAIMER = "AI-based estimate, not medical advice. Actual calories may vary based on ingredients and preparation.";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// TYPES
// ============================================

interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
}

interface FoodIdentificationRequest {
  image: string; // base64-encoded JPEG
}

interface FoodIdentificationResponse {
  foodDetected: boolean;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  confidenceScore: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  macros: { protein: number; carbs: number; fat: number } | null;
  disclaimer: string;
  identifiedAt: string;
}

interface ErrorResponse {
  error: string;
  code: string;
}

interface MockedFood {
  items: FoodItem[];
  totalCalories: number;
  confidenceScore: number;
}

// Vision response structure from tool call
interface VisionAnalysisResult {
  foodDetected: boolean;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  confidenceScore: number; // 0-100
  reasoning: string;
  macros: { protein: number; carbs: number; fat: number } | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getConfidenceLabel(score: number): "high" | "medium" | "low" {
  if (score >= CONFIDENCE_THRESHOLD_HIGH * 100) return "high";
  if (score >= CONFIDENCE_THRESHOLD_MEDIUM * 100) return "medium";
  return "low";
}

function validateRequest(body: unknown): { valid: true; data: FoodIdentificationRequest } | { valid: false; error: ErrorResponse } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: { error: "Invalid request body", code: "INVALID_BODY" } };
  }

  const { image } = body as Record<string, unknown>;

  if (!image || typeof image !== "string") {
    return { valid: false, error: { error: "Missing or invalid 'image' field", code: "MISSING_IMAGE" } };
  }

  const estimatedBytes = (image.length * 3) / 4;
  console.log(`[identify-food] Image payload: ${Math.round(estimatedBytes / 1024)}KB`);

  return { valid: true, data: { image } };
}

// ============================================
// MOCKED DATA (fallback)
// ============================================
const MOCKED_FOODS: MockedFood[] = [
  { 
    items: [
      { name: "Grilled Chicken Breast", portion: "medium", estimatedCalories: 165 },
      { name: "Steamed Rice", portion: "medium", estimatedCalories: 200 },
      { name: "Mixed Vegetables", portion: "small", estimatedCalories: 50 }
    ],
    totalCalories: 415,
    confidenceScore: 78
  },
  { 
    items: [
      { name: "Caesar Salad", portion: "large", estimatedCalories: 350 },
      { name: "Garlic Bread", portion: "small", estimatedCalories: 120 }
    ],
    totalCalories: 470,
    confidenceScore: 72
  },
  { 
    items: [
      { name: "Cheeseburger", portion: "medium", estimatedCalories: 550 },
      { name: "French Fries", portion: "medium", estimatedCalories: 365 }
    ],
    totalCalories: 915,
    confidenceScore: 85
  },
];

function getMockedResponse(): FoodIdentificationResponse {
  const randomIndex = Math.floor(Math.random() * MOCKED_FOODS.length);
  const food = MOCKED_FOODS[randomIndex];

  return {
    foodDetected: true,
    items: food.items,
    totalCalories: food.totalCalories,
    confidenceScore: food.confidenceScore,
    confidence: getConfidenceLabel(food.confidenceScore),
    reasoning: `Mocked response for testing`,
    macros: food.confidenceScore >= 70 ? { protein: 25, carbs: 45, fat: 18 } : null,
    disclaimer: DISCLAIMER,
    identifiedAt: new Date().toISOString(),
  };
}

/**
 * Call Vision API via Lovable AI Gateway for food identification
 */
async function callVisionAPI(imageBase64: string, apiKey: string): Promise<VisionAnalysisResult> {
  const systemPrompt = `You are a food and calorie estimation expert. Analyze food images and estimate calories.

Rules:
- foodDetected: true if food is visible, false otherwise
- Identify each visible food item on the plate
- Estimate portion size: "small", "medium", or "large"
- Estimate calories per item (use null if very uncertain)
- confidenceScore: 0-100 integer based on image clarity and food visibility
- If confidence < 70: provide calorie range instead of exact number, no macros
- If confidence >= 70: can provide macros estimate
- Prefer conservative calorie estimates
- If image quality is poor or food unclear, lower confidence
- totalCalories: sum of all items, or {min, max} range if uncertain
- Return JSON only, no explanations.`;

  const tools = [
    {
      type: "function",
      function: {
        name: "identify_food",
        description: "Return food identification and calorie estimate",
        parameters: {
          type: "object",
          properties: {
            foodDetected: { type: "boolean" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  portion: { type: "string", enum: ["small", "medium", "large"] },
                  estimatedCalories: { type: ["integer", "null"] }
                },
                required: ["name", "portion", "estimatedCalories"]
              }
            },
            totalCalories: {
              oneOf: [
                { type: "integer" },
                { type: "object", properties: { min: { type: "integer" }, max: { type: "integer" } }, required: ["min", "max"] },
                { type: "null" }
              ]
            },
            confidenceScore: { type: "integer", minimum: 0, maximum: 100 },
            reasoning: { type: "string" },
            macros: {
              oneOf: [
                { 
                  type: "object", 
                  properties: { 
                    protein: { type: "integer" }, 
                    carbs: { type: "integer" }, 
                    fat: { type: "integer" } 
                  }, 
                  required: ["protein", "carbs", "fat"] 
                },
                { type: "null" }
              ]
            }
          },
          required: ["foodDetected", "items", "totalCalories", "confidenceScore", "reasoning", "macros"],
          additionalProperties: false
        }
      }
    }
  ];

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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the food and estimate calories." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: "identify_food" } },
        max_tokens: 500
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      console.error(`[identify-food] Vision API error: ${status}`);
      throw new Error(`Vision API error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "identify_food") {
      throw new Error("Invalid response from Vision API");
    }

    const result = JSON.parse(toolCall.function.arguments) as VisionAnalysisResult;
    
    // Clamp confidence
    result.confidenceScore = Math.round(Math.max(0, Math.min(100, result.confidenceScore)));
    
    console.log(`[identify-food] Result: detected=${result.foodDetected}, items=${result.items.length}, confidence=${result.confidenceScore}`);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      console.error(`[identify-food] Vision API timeout after ${VISION_TIMEOUT_MS}ms`);
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
    console.log(`[identify-food] Request received`);

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
      console.log(`[identify-food] Validation failed | code: ${validation.error.code}`);
      return new Response(
        JSON.stringify(validation.error),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (USE_MOCK_DATA) {
      const mockResponse = getMockedResponse();
      console.log(`[identify-food] Using mocked response`);
      return new Response(
        JSON.stringify(mockResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[identify-food] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "Vision service not configured", code: "SERVICE_UNAVAILABLE" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let visionResult: VisionAnalysisResult;
    try {
      visionResult = await callVisionAPI(validation.data.image, apiKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[identify-food] Vision API call failed | error: ${errorMessage}`);
      
      return new Response(
        JSON.stringify({ error: errorMessage, code: "VISION_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { foodDetected, items, totalCalories, confidenceScore, reasoning, macros } = visionResult;

    // No food detected
    if (!foodDetected) {
      const response: FoodIdentificationResponse = {
        foodDetected: false,
        items: [],
        totalCalories: null,
        confidenceScore: Math.min(confidenceScore, 50),
        confidence: "low",
        reasoning: reasoning || "No food detected in the image.",
        macros: null,
        disclaimer: DISCLAIMER,
        identifiedAt: new Date().toISOString(),
      };
      
      console.log(`[identify-food] No food detected`);
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only include macros if confidence >= 70
    const finalMacros = confidenceScore >= 70 ? macros : null;

    const response: FoodIdentificationResponse = {
      foodDetected: true,
      items: items,
      totalCalories: totalCalories,
      confidenceScore: confidenceScore,
      confidence: getConfidenceLabel(confidenceScore),
      reasoning: reasoning,
      macros: finalMacros,
      disclaimer: DISCLAIMER,
      identifiedAt: new Date().toISOString(),
    };
    
    console.log(`[identify-food] Result: ${items.length} items, calories=${JSON.stringify(totalCalories)}, confidence=${confidenceScore}%`);
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[identify-food] Unhandled error: ${errorMessage}`);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
