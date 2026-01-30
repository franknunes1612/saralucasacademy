import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  checkRateLimit, 
  getClientIdentifier, 
  rateLimitResponse,
  type RateLimitConfig 
} from "../_shared/rateLimit.ts";

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

// Rate limit: 20 requests per minute per IP (more restrictive due to AI costs)
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "identify-food",
};

// ============================================
// TYPES
// ============================================

type PortionSize = "small" | "medium" | "large";
type PlateType = "single_item" | "half_plate" | "full_plate" | "mixed_dish" | "bowl" | "snack";
type FoodCategory = "fruit" | "vegetable" | "grain" | "protein_lean" | "protein_fatty" | "dairy" | "fried" | "sauce" | "drink" | "drink_zero" | "dessert" | "unknown";

interface FoodItem {
  name: string;
  portion: PortionSize;
  estimatedCalories: number | null;
  category?: FoodCategory;
  calorieRange?: { min: number; max: number };
}

interface FoodIdentificationRequest {
  image: string; // base64-encoded JPEG
}

interface FoodIdentificationResponse {
  foodDetected: boolean;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  calorieRange: { min: number; max: number } | null; // Internal range for transparency
  confidenceScore: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  macros: { protein: number; carbs: number; fat: number } | null;
  plateType: PlateType;
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
  items: Array<{
    name: string;
    portion: PortionSize;
    estimatedCalories: number | null;
    category?: FoodCategory;
  }>;
  totalCalories: number | { min: number; max: number } | null;
  confidenceScore: number; // 0-100
  reasoning: string;
  macros: { protein: number; carbs: number; fat: number } | null;
  plateType?: PlateType;
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
 * Food category to macro ratio mapping
 * Used to infer macros when only calories are known
 */
const CATEGORY_MACRO_RATIOS: Record<FoodCategory, { protein: number; carbs: number; fat: number }> = {
  fruit: { protein: 0.04, carbs: 0.92, fat: 0.04 },       // ~85-90% carbs
  vegetable: { protein: 0.15, carbs: 0.75, fat: 0.10 },   // Carb dominant, some protein
  grain: { protein: 0.12, carbs: 0.78, fat: 0.10 },       // High carb
  protein_lean: { protein: 0.70, carbs: 0.05, fat: 0.25 },// High protein
  protein_fatty: { protein: 0.45, carbs: 0.05, fat: 0.50 },// Protein + fat
  dairy: { protein: 0.25, carbs: 0.35, fat: 0.40 },       // Balanced
  fried: { protein: 0.15, carbs: 0.40, fat: 0.45 },       // High fat
  sauce: { protein: 0.05, carbs: 0.50, fat: 0.45 },       // Fat + carbs
  drink: { protein: 0.02, carbs: 0.95, fat: 0.03 },       // Almost all carbs
  drink_zero: { protein: 0, carbs: 0, fat: 0 },           // Zero-calorie beverages
  dessert: { protein: 0.05, carbs: 0.55, fat: 0.40 },     // Carbs + fat
  unknown: { protein: 0.20, carbs: 0.50, fat: 0.30 },     // Conservative balance
};

/**
 * Default calorie estimates by food category (per medium portion)
 */
const CATEGORY_CALORIE_DEFAULTS: Record<FoodCategory, number> = {
  fruit: 60,
  vegetable: 35,
  grain: 150,
  protein_lean: 120,
  protein_fatty: 200,
  dairy: 100,
  fried: 250,
  sauce: 80,
  drink: 120,
  drink_zero: 0,  // Zero-calorie beverages
  dessert: 200,
  unknown: 80,
};

/**
 * Infer macros from calories using food category ratios
 * This ensures macros are ALWAYS present when calories exist
 */
function inferMacrosFromCalories(
  calories: number, 
  category: FoodCategory = "unknown"
): { protein: number; carbs: number; fat: number } {
  const safeCalories = safeNumber(calories, 0);
  if (safeCalories <= 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  const ratios = CATEGORY_MACRO_RATIOS[category] || CATEGORY_MACRO_RATIOS.unknown;
  
  // Calculate grams: protein=4kcal/g, carbs=4kcal/g, fat=9kcal/g
  const protein = Math.round((safeCalories * ratios.protein) / 4);
  const carbs = Math.round((safeCalories * ratios.carbs) / 4);
  const fat = Math.round((safeCalories * ratios.fat) / 9);
  
  return { protein, carbs, fat };
}

/**
 * Zero-calorie beverage patterns
 * These items should ALWAYS return 0 calories regardless of portion
 */
const ZERO_CALORIE_PATTERNS = [
  // Water variants
  /\b(water|água|wasser)\b/i,
  /\b(sparkling water|carbonated water|mineral water|soda water|seltzer)\b/i,
  /\b(pedras|perrier|san pellegrino|pellegrino|evian|fiji|voss)\b/i,
  /\b(água com gás|água mineral|água gaseificada)\b/i,
  // Unsweetened tea/coffee
  /\b(black coffee|espresso|americano|plain coffee)\b/i,
  /\b(unsweetened tea|plain tea|green tea|herbal tea|chá sem açúcar)\b/i,
  // Zero/diet drinks
  /\b(zero|diet|sugar[- ]?free|light|sem açúcar|sin azúcar)\b/i,
  /\b(coke zero|pepsi zero|sprite zero|fanta zero)\b/i,
];

/**
 * Check if an item is a zero-calorie beverage
 */
function isZeroCalorieBeverage(name: string): boolean {
  const lower = name.toLowerCase();
  
  // Check against zero-calorie patterns
  for (const pattern of ZERO_CALORIE_PATTERNS) {
    if (pattern.test(lower)) {
      // Make sure it's not a sweetened variant that mentions "water" or similar
      const sweetenedPatterns = /\b(sugar|sweetened|flavored|syrup|honey|açúcar|adoçado)\b/i;
      if (!sweetenedPatterns.test(lower)) {
        console.log(`[identify-food] Zero-calorie beverage detected: "${name}"`);
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Detect food category from name (simple heuristic)
 */
function detectFoodCategory(name: string): FoodCategory {
  const lower = name.toLowerCase();
  
  // FIRST: Check for zero-calorie beverages
  if (isZeroCalorieBeverage(name)) {
    return "drink_zero";
  }
  
  // Fruits
  if (/\b(apple|banana|orange|mandarin|tangerine|mango|grape|berry|berries|melon|pear|peach|plum|kiwi|pineapple|strawberry|blueberry|raspberry|watermelon|fruit)\b/.test(lower)) {
    return "fruit";
  }
  
  // Vegetables
  if (/\b(salad|lettuce|tomato|cucumber|carrot|broccoli|spinach|kale|vegetable|veggie|greens|pepper|onion|celery|cabbage|zucchini)\b/.test(lower)) {
    return "vegetable";
  }
  
  // Grains
  if (/\b(rice|pasta|bread|noodle|cereal|oat|quinoa|couscous|bagel|toast|roll|bun|grain|wheat|corn)\b/.test(lower)) {
    return "grain";
  }
  
  // Lean proteins
  if (/\b(chicken breast|turkey breast|fish|cod|tilapia|shrimp|egg white|tofu|white meat)\b/.test(lower)) {
    return "protein_lean";
  }
  
  // Fatty proteins
  if (/\b(beef|steak|pork|lamb|salmon|bacon|sausage|chicken thigh|dark meat|ribs)\b/.test(lower)) {
    return "protein_fatty";
  }
  
  // Dairy
  if (/\b(milk|cheese|yogurt|cream|butter|dairy)\b/.test(lower)) {
    return "dairy";
  }
  
  // Fried foods
  if (/\b(fried|fries|chips|nugget|wing|crispy|battered|deep-fried)\b/.test(lower)) {
    return "fried";
  }
  
  // Sauces
  if (/\b(sauce|dressing|gravy|mayo|mayonnaise|ketchup|mustard|oil|butter)\b/.test(lower)) {
    return "sauce";
  }
  
  // Regular drinks (caloric)
  if (/\b(juice|soda|smoothie|shake|latte|cappuccino|mocha|frappuccino|milkshake)\b/.test(lower)) {
    return "drink";
  }
  
  // Desserts
  if (/\b(cake|cookie|ice cream|chocolate|candy|dessert|pie|brownie|donut|pastry|sweet)\b/.test(lower)) {
    return "dessert";
  }
  
  return "unknown";
}

/**
 * Sanitize food item to ensure all values are valid
 */
function sanitizeFoodItem(item: Partial<FoodItem>): FoodItem {
  const validPortions = ["small", "medium", "large"] as const;
  const portion = validPortions.includes(item.portion as typeof validPortions[number]) 
    ? item.portion as "small" | "medium" | "large"
    : "medium"; // Default to medium if missing or invalid
  
  const category = item.category || detectFoodCategory(item.name || "");
  
  return {
    name: item.name || "Unknown item",
    portion,
    estimatedCalories: safeNumber(item.estimatedCalories, null as unknown as number) || null,
    category,
  };
}

/**
 * Sanitize macros to ensure all values are valid numbers
 * NEVER returns null if we have valid calories - always infer macros
 */
function sanitizeMacros(
  macros: { protein?: number; carbs?: number; fat?: number } | null | undefined,
  totalCalories: number = 0,
  dominantCategory: FoodCategory = "unknown"
): { protein: number; carbs: number; fat: number } {
  // Try to use provided macros first
  if (macros) {
    const protein = safeNumber(macros.protein, 0);
    const carbs = safeNumber(macros.carbs, 0);
    const fat = safeNumber(macros.fat, 0);
    
    // If we have valid macros, use them
    if (protein > 0 || carbs > 0 || fat > 0) {
      return { protein, carbs, fat };
    }
  }
  
  // Always infer macros from calories if we have them
  if (totalCalories > 0) {
    console.log(`[identify-food] Inferring macros from ${totalCalories} kcal (category: ${dominantCategory})`);
    return inferMacrosFromCalories(totalCalories, dominantCategory);
  }
  
  // Last resort: return zeros
  return { protein: 0, carbs: 0, fat: 0 };
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
 * Apply zero-calorie guardrail to detected items
 * MUST run BEFORE any other calorie processing
 */
function applyZeroCalorieGuardrail(items: FoodItem[]): FoodItem[] {
  return items.map(item => {
    const category = detectFoodCategory(item.name);
    
    // If it's a zero-calorie beverage, force 0 calories
    if (category === "drink_zero") {
      console.log(`[identify-food] Zero-calorie guardrail applied: "${item.name}" → 0 kcal`);
      return {
        ...item,
        estimatedCalories: 0,
        category: "drink_zero",
      };
    }
    
    return { ...item, category: item.category || category };
  });
}

/**
 * Apply fallback calorie estimates for items with missing data
 * Uses category-specific defaults with portion multipliers
 * IMPORTANT: Zero-calorie items are handled separately and skipped here
 */
function applyFallbackEstimates(items: FoodItem[]): FoodItem[] {
  return items.map(item => {
    // Zero-calorie items should never get fallback calories
    if (item.category === "drink_zero") {
      return { ...item, estimatedCalories: 0 };
    }
    
    // If item already has valid calories, keep it
    if (item.estimatedCalories !== null && item.estimatedCalories !== undefined && 
        Number.isFinite(item.estimatedCalories) && item.estimatedCalories >= 0) {
      // Ensure category is set
      const category = item.category || detectFoodCategory(item.name);
      return { ...item, category };
    }
    
    // Detect category if not set
    const category = item.category || detectFoodCategory(item.name);
    
    // Get category-specific base calories
    const baseCalories = CATEGORY_CALORIE_DEFAULTS[category] || CATEGORY_CALORIE_DEFAULTS.unknown;
    
    // Apply portion multiplier consistently
    const portionMultiplier = item.portion === "small" ? 0.7 : item.portion === "large" ? 1.4 : 1.0;
    const fallbackCalories = Math.round(baseCalories * portionMultiplier);
    
    console.log(`[identify-food] Applied fallback for "${item.name}" (${category}): ${fallbackCalories} kcal (${item.portion})`);
    
    return {
      ...item,
      estimatedCalories: fallbackCalories,
      category,
    };
  });
}

/**
 * Determine dominant food category from items for macro inference
 */
function getDominantCategory(items: FoodItem[]): FoodCategory {
  if (items.length === 0) return "unknown";
  if (items.length === 1) return items[0].category || "unknown";
  
  // For mixed dishes, find highest calorie item's category
  let maxCal = 0;
  let dominant: FoodCategory = "unknown";
  
  for (const item of items) {
    const cal = safeNumber(item.estimatedCalories, 0);
    if (cal > maxCal) {
      maxCal = cal;
      dominant = item.category || "unknown";
    }
  }
  
  return dominant;
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
  const variance = 0.15; // ±15% range
  const minCal = Math.round(food.totalCalories * (1 - variance));
  const maxCal = Math.round(food.totalCalories * (1 + variance));

  return {
    foodDetected: true,
    items: food.items,
    totalCalories: food.totalCalories,
    calorieRange: { min: minCal, max: maxCal },
    confidenceScore: food.confidenceScore,
    confidence: getConfidenceLabel(food.confidenceScore),
    reasoning: `Mocked response for testing`,
    macros: food.confidenceScore >= 70 ? { protein: 25, carbs: 45, fat: 18 } : null,
    plateType: "mixed_dish",
    disclaimer: DISCLAIMER,
    identifiedAt: new Date().toISOString(),
  };
}

/**
 * Call Vision API via Lovable AI Gateway for food identification
 */
async function callVisionAPI(imageBase64: string, apiKey: string): Promise<VisionAnalysisResult> {
  const systemPrompt = `You are a food nutrition AI analyst, part of the Sara Lucas Nutrition Academy. You analyze food photos to estimate calories and macronutrients.

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

  // Rate limiting
  const clientId = getClientIdentifier(req);
  const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    console.log(`[identify-food] Rate limit exceeded for ${clientId}`);
    return rateLimitResponse(rateLimitResult, corsHeaders);
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log(`[identify-food] Request received from ${clientId}`);

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
        calorieRange: null,
        confidenceScore: safeNumber(Math.min(confidenceScore, 50), 30),
        confidence: "low",
        reasoning: reasoning || "No food detected in the image.",
        macros: null,
        plateType: "single_item",
        disclaimer: DISCLAIMER,
        identifiedAt: new Date().toISOString(),
      };
      
      console.log(`[identify-food] No food detected`);
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FIRST: Apply zero-calorie guardrail (must run before any other processing)
    const guardedItems = applyZeroCalorieGuardrail(items);
    
    // Apply fallback estimates for items missing calories (skips zero-calorie items)
    const sanitizedItems = applyFallbackEstimates(guardedItems);

    // Sanitize confidence score first (used in multiple places)
    const finalConfidence = safeNumber(confidenceScore, 50);
    
    // Check if ALL items are zero-calorie beverages
    const allZeroCalorie = sanitizedItems.every(item => item.category === "drink_zero");

    // Calculate total calories from items if missing
    let finalTotalCalories = sanitizeTotalCalories(totalCalories);
    
    // For zero-calorie items, force total to 0
    if (allZeroCalorie && sanitizedItems.length > 0) {
      finalTotalCalories = 0;
      console.log(`[identify-food] All items are zero-calorie beverages, total = 0`);
    } else if (finalTotalCalories === null && sanitizedItems.length > 0) {
      const sum = sanitizedItems.reduce((acc, item) => acc + safeNumber(item.estimatedCalories, 0), 0);
      if (sum >= 0) {
        finalTotalCalories = Math.round(sum);
        console.log(`[identify-food] Calculated total calories from items: ${finalTotalCalories}`);
      }
    }

    // Calculate calorie range based on confidence (±10-20% variance)
    // For zero-calorie items, range is always 0-0
    const baseCalories = typeof finalTotalCalories === "number" 
      ? finalTotalCalories 
      : finalTotalCalories 
        ? Math.round((finalTotalCalories.min + finalTotalCalories.max) / 2)
        : 0;
    
    // Zero-calorie items get no range uncertainty
    let calorieRange: { min: number; max: number } | null = null;
    if (allZeroCalorie) {
      calorieRange = null; // No range for zero-calorie items
    } else if (baseCalories > 0) {
      // Higher confidence = smaller range, lower confidence = wider range
      const variancePercent = finalConfidence >= 80 ? 0.10 : finalConfidence >= 60 ? 0.15 : 0.20;
      calorieRange = { 
        min: Math.round(baseCalories * (1 - variancePercent)), 
        max: Math.round(baseCalories * (1 + variancePercent)) 
      };
    }

    // Determine plate type based on items
    const plateType: PlateType = sanitizedItems.length === 1 
      ? "single_item" 
      : sanitizedItems.length >= 3 
        ? "mixed_dish" 
        : "half_plate";

    // For zero-calorie items, macros are always 0
    // Otherwise, infer from calories if not provided
    let finalMacros: { protein: number; carbs: number; fat: number };
    if (allZeroCalorie) {
      finalMacros = { protein: 0, carbs: 0, fat: 0 };
      console.log(`[identify-food] Zero-calorie item(s), macros = 0`);
    } else {
      const dominantCategory = getDominantCategory(sanitizedItems);
      finalMacros = sanitizeMacros(macros, baseCalories, dominantCategory);
    }

    // Final sanity check - ensure all values are valid
    const response: FoodIdentificationResponse = {
      foodDetected: true,
      items: sanitizedItems,
      totalCalories: finalTotalCalories,
      calorieRange,
      confidenceScore: finalConfidence,
      confidence: getConfidenceLabel(finalConfidence),
      reasoning: reasoning || "Food identified from image.",
      macros: finalMacros,
      plateType,
      disclaimer: DISCLAIMER,
      identifiedAt: new Date().toISOString(),
    };
    
    console.log(`[identify-food] Final result: ${sanitizedItems.length} items, calories=${JSON.stringify(finalTotalCalories)}, range=${JSON.stringify(calorieRange)}, plateType=${plateType}, confidence=${finalConfidence}%`);
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
