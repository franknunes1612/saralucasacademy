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
  const safeScore = safeNumber(score, 0);
  if (safeScore >= CONFIDENCE_THRESHOLD_HIGH * 100) return "high";
  if (safeScore >= CONFIDENCE_THRESHOLD_MEDIUM * 100) return "medium";
  return "low";
}

/**
 * Safe number conversion - prevents NaN values
 */
function safeNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Sanitize food item to ensure all values are valid
 */
function sanitizeFoodItem(item: Partial<FoodItem>): FoodItem {
  const validPortions = ["small", "medium", "large"] as const;
  const portion = validPortions.includes(item.portion as typeof validPortions[number]) 
    ? item.portion as "small" | "medium" | "large"
    : "medium"; // Default to medium if missing or invalid
  
  return {
    name: item.name || "Unknown item",
    portion,
    estimatedCalories: safeNumber(item.estimatedCalories, null as unknown as number) || null,
  };
}

/**
 * Sanitize macros to ensure all values are valid numbers
 */
function sanitizeMacros(macros: { protein?: number; carbs?: number; fat?: number } | null | undefined): { protein: number; carbs: number; fat: number } | null {
  if (!macros) return null;
  
  const protein = safeNumber(macros.protein, 0);
  const carbs = safeNumber(macros.carbs, 0);
  const fat = safeNumber(macros.fat, 0);
  
  // If all macros are 0, return null instead
  if (protein === 0 && carbs === 0 && fat === 0) return null;
  
  return { protein, carbs, fat };
}

/**
 * Sanitize total calories - handle both number and range formats
 */
function sanitizeTotalCalories(calories: number | { min: number; max: number } | null | undefined): number | { min: number; max: number } | null {
  if (calories === null || calories === undefined) return null;
  
  if (typeof calories === "object" && calories !== null) {
    const min = safeNumber(calories.min, 0);
    const max = safeNumber(calories.max, 0);
    if (min === 0 && max === 0) return null;
    return { min, max };
  }
  
  const num = safeNumber(calories, 0);
  return num > 0 ? num : null;
}

/**
 * Apply fallback calorie estimates for items with missing data
 */
function applyFallbackEstimates(items: FoodItem[]): FoodItem[] {
  return items.map(item => {
    // If item already has valid calories, keep it
    if (item.estimatedCalories && Number.isFinite(item.estimatedCalories) && item.estimatedCalories > 0) {
      return item;
    }
    
    // Apply conservative fallback based on portion size
    const portionMultiplier = item.portion === "small" ? 0.7 : item.portion === "large" ? 1.4 : 1.0;
    const baseFallback = 80; // Conservative base estimate
    const fallbackCalories = Math.round(baseFallback * portionMultiplier);
    
    console.log(`[identify-food] Applied fallback calories for "${item.name}": ${fallbackCalories} kcal`);
    
    return {
      ...item,
      estimatedCalories: fallbackCalories,
    };
  });
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
  const systemPrompt = `You are CalorieSpot, an expert nutritionist AI analyzing food photos to estimate calories and macronutrients.

CORE PRINCIPLES:
- Prioritize visual consistency over absolute precision
- Never claim exact measurements - all values are informed estimates
- Focus on plates with multiple food components
- Favor coherent, believable estimates that make sense to users

PORTION ESTIMATION (CRITICAL):
1. RELATIVE CLASSIFICATION - For each food item, classify portion as:
   - "small": Less than typical serving, minimal plate area (<25% of plate)
   - "medium": Standard serving, moderate plate area (25-50% of plate)
   - "large": Generous serving, significant plate area (>50% of plate)

2. VISUAL CUES TO CONSIDER:
   - Visual area occupied on the plate relative to other items
   - Apparent height/stacking (pasta, rice, salads pile up)
   - Comparison with other items on the same plate
   - Standard reference objects if visible (fork, spoon, plate rim)

FOOD CATEGORY DENSITY MULTIPLIERS (apply to calorie calculations):
- Leafy vegetables: VERY LOW density (25-35 kcal/100g)
- Other vegetables: LOW density (30-60 kcal/100g)
- Fruits: LOW density (40-70 kcal/100g)
- Lean proteins (chicken breast, white fish): MEDIUM density (100-150 kcal/100g)
- Grains/pasta/rice (cooked): MEDIUM density (100-150 kcal/100g)
- Bread/baked goods: MEDIUM-HIGH density (200-300 kcal/100g)
- Fatty proteins (red meat, salmon, sausage): HIGH density (200-300 kcal/100g)
- Fried foods: HIGH density (250-350 kcal/100g)
- Cheese, nuts, oils, sauces: VERY HIGH density (300-700 kcal/100g)

PLATE-LEVEL NORMALIZATION:
- If one item occupies >60% of plate, let it dominate the calorie total
- If 3+ distinct food items detected, slightly reduce individual portions to avoid overcounting
- If visible sauces, oils, or dressings present, add a small fat buffer (+20-40 kcal, +3-5g fat)
- Starchy sides (rice, pasta) often look larger than they are calorically

MIXED DISH HANDLING:
- Identify each component separately (protein, carbs, vegetables, sauces)
- Estimate each component's portion independently
- Sum values only after individual portion classification
- Do NOT average portions across unrelated foods

CALORIE ESTIMATION RULES:
- Round to nearest 5 for individual items
- Round to nearest 10 for totals
- Use conservative estimates (slight undercount preferred over overcount)
- Account for visible oils, sauces, cheese as separate fat additions

MACRO ESTIMATION:
- Protein: meat, fish, eggs, legumes, dairy, tofu
- Carbs: grains, bread, pasta, rice, potatoes, fruits, sugar
- Fat: oils, butter, cheese, fatty meats, nuts, fried coatings

CONFIDENCE SCORING (0-100):
- 85-100: Clear photo, recognizable foods, good lighting, clear portions
- 70-84: Good visibility, some uncertainty in portions or preparation
- 50-69: Partial visibility, unfamiliar foods, or stacked items - use calorie range
- Below 50: Poor image, unclear - use wide calorie range

OUTPUT RULES:
- foodDetected: true only if food is clearly visible
- Always identify individual items, not just "mixed plate"
- If confidence < 70: use {min, max} calorie range
- If confidence >= 70: provide exact calorie number and macros
- Reasoning: briefly explain what you see and how you estimated portions
- Return valid JSON only`;

  const tools = [
    {
      type: "function",
      function: {
        name: "identify_food",
        description: "Analyze food photo and return calorie/macro estimates",
        parameters: {
          type: "object",
          properties: {
            foodDetected: { 
              type: "boolean",
              description: "True if food is visible in the image"
            },
            items: {
              type: "array",
              description: "List of identified food items on the plate",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Food item name" },
                  portion: { type: "string", enum: ["small", "medium", "large"] },
                  estimatedCalories: { type: ["integer", "null"], description: "Calories for this item" }
                },
                required: ["name", "portion", "estimatedCalories"]
              }
            },
            totalCalories: {
              oneOf: [
                { type: "integer", description: "Total calories if confident" },
                { type: "object", properties: { min: { type: "integer" }, max: { type: "integer" } }, required: ["min", "max"], description: "Calorie range if uncertain" },
                { type: "null" }
              ]
            },
            confidenceScore: { 
              type: "integer", 
              minimum: 0, 
              maximum: 100,
              description: "Confidence in the estimate (0-100)"
            },
            reasoning: { 
              type: "string",
              description: "Brief explanation of what was detected and how calories were estimated"
            },
            macros: {
              oneOf: [
                { 
                  type: "object", 
                  properties: { 
                    protein: { type: "integer", description: "Protein in grams" }, 
                    carbs: { type: "integer", description: "Carbohydrates in grams" }, 
                    fat: { type: "integer", description: "Fat in grams" } 
                  }, 
                  required: ["protein", "carbs", "fat"] 
                },
                { type: "null" }
              ],
              description: "Macronutrients in grams (only if confidence >= 70)"
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

    const rawResult = JSON.parse(toolCall.function.arguments) as VisionAnalysisResult;
    
    // Sanitize all values to prevent NaN
    const result: VisionAnalysisResult = {
      foodDetected: Boolean(rawResult.foodDetected),
      items: (rawResult.items || []).map(sanitizeFoodItem),
      totalCalories: sanitizeTotalCalories(rawResult.totalCalories),
      confidenceScore: safeNumber(rawResult.confidenceScore, 50),
      reasoning: rawResult.reasoning || "Food identified from image.",
      macros: sanitizeMacros(rawResult.macros),
    };
    
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

    let { foodDetected, items, totalCalories, confidenceScore, reasoning, macros } = visionResult;

    // No food detected
    if (!foodDetected) {
      const response: FoodIdentificationResponse = {
        foodDetected: false,
        items: [],
        totalCalories: null,
        confidenceScore: safeNumber(Math.min(confidenceScore, 50), 30),
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

    // Apply fallback estimates for items missing calories
    const sanitizedItems = applyFallbackEstimates(items);

    // Calculate total calories from items if missing
    let finalTotalCalories = sanitizeTotalCalories(totalCalories);
    if (finalTotalCalories === null && sanitizedItems.length > 0) {
      const sum = sanitizedItems.reduce((acc, item) => acc + safeNumber(item.estimatedCalories, 0), 0);
      if (sum > 0) {
        finalTotalCalories = Math.round(sum);
        console.log(`[identify-food] Calculated total calories from items: ${finalTotalCalories}`);
      }
    }

    // Sanitize confidence score
    const finalConfidence = safeNumber(confidenceScore, 50);

    // Only include macros if confidence >= 70 and macros are valid
    const finalMacros = finalConfidence >= 70 ? sanitizeMacros(macros) : null;

    // Final sanity check - ensure all values are valid
    const response: FoodIdentificationResponse = {
      foodDetected: true,
      items: sanitizedItems,
      totalCalories: finalTotalCalories,
      confidenceScore: finalConfidence,
      confidence: getConfidenceLabel(finalConfidence),
      reasoning: reasoning || "Food identified from image.",
      macros: finalMacros,
      disclaimer: DISCLAIMER,
      identifiedAt: new Date().toISOString(),
    };
    
    console.log(`[identify-food] Final result: ${sanitizedItems.length} items, calories=${JSON.stringify(finalTotalCalories)}, macros=${JSON.stringify(finalMacros)}, confidence=${finalConfidence}%`);
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
