import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  checkRateLimit, 
  getClientIdentifier, 
  rateLimitResponse,
  addRateLimitHeaders,
  type RateLimitConfig 
} from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 30 requests per minute per IP
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "lookup-barcode",
};

interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal_serving"?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  serving_quantity?: number;
  image_url?: string;
  categories?: string;
  quantity?: string;
}

interface NutritionResult {
  found: boolean;
  barcode: string;
  product?: {
    name: string;
    brand: string | null;
    servingSize: string | null;
    calories: number | null;
    caloriesPer100g: number | null;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    } | null;
    imageUrl: string | null;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientId = getClientIdentifier(req);
  const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    console.log(`[lookup-barcode] Rate limit exceeded for ${clientId}`);
    return rateLimitResponse(rateLimitResult, corsHeaders);
  }

  try {
    const { barcode } = await req.json();

    if (!barcode || typeof barcode !== "string") {
      return new Response(
        JSON.stringify({ found: false, barcode: "", error: "Invalid barcode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean barcode (remove any spaces or dashes)
    const cleanBarcode = barcode.replace(/[\s-]/g, "");

    console.log(`[lookup-barcode] Looking up barcode: ${cleanBarcode}`);

    // Query Open Food Facts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`,
      {
        headers: {
          "User-Agent": "SaraLucasApp/1.0 - Food calorie tracking app",
        },
      }
    );

    if (!response.ok) {
      console.error(`[lookup-barcode] API error: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          found: false, 
          barcode: cleanBarcode,
          error: "Failed to lookup product" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      console.log(`[lookup-barcode] Product not found: ${cleanBarcode}`);
      return new Response(
        JSON.stringify({ 
          found: false, 
          barcode: cleanBarcode,
          error: "Product not found in database" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const product: OpenFoodFactsProduct = data.product;
    const nutriments = product.nutriments || {};

    // Build nutrition result
    const result: NutritionResult = {
      found: true,
      barcode: cleanBarcode,
      product: {
        name: product.product_name || "Unknown Product",
        brand: product.brands || null,
        servingSize: product.serving_size || product.quantity || null,
        calories: nutriments["energy-kcal_serving"] || null,
        caloriesPer100g: nutriments["energy-kcal_100g"] || null,
        macros: (nutriments.proteins_100g !== undefined || 
                 nutriments.carbohydrates_100g !== undefined || 
                 nutriments.fat_100g !== undefined) ? {
          protein: Math.round(nutriments.proteins_100g || 0),
          carbs: Math.round(nutriments.carbohydrates_100g || 0),
          fat: Math.round(nutriments.fat_100g || 0),
        } : null,
        imageUrl: product.image_url || null,
      },
    };

    console.log(`[lookup-barcode] Found: ${result.product?.name}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[lookup-barcode] Error:", error);
    return new Response(
      JSON.stringify({ 
        found: false, 
        barcode: "",
        error: "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
