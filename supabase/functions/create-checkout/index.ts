import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Product types that can be purchased
type ProductType = "academy_item" | "premium_offer" | "store_item";

interface CheckoutRequest {
  productId: string;
  productType: ProductType;
  guestCheckout?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase config missing");

    // Parse request body
    const { productId, productType, guestCheckout = false }: CheckoutRequest = await req.json();
    if (!productId) throw new Error("Product ID is required");
    if (!productType) throw new Error("Product type is required");
    logStep("Request parsed", { productId, productType, guestCheckout });

    let userId: string | null = null;
    let userEmail: string | null = null;

    // Check for authenticated user (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ") && !guestCheckout) {
      const token = authHeader.slice("Bearer ".length);

      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      });

      const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
      if (!claimsError && claimsData?.claims) {
        userId = claimsData.claims.sub || null;
        userEmail = ((claimsData.claims as Record<string, unknown>).email as string) || null;
        logStep("User authenticated", { userId, email: userEmail });
      }
    }

    // Create a basic Supabase client for product lookup
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // Fetch product details based on type
    let productName: string;
    let productDescription: string;
    let price: number;
    let currency: string;
    let stripePriceId: string | null = null;
    let successPath: string;

    if (productType === "academy_item") {
      const { data: product, error } = await supabaseClient
        .from("academy_items")
        .select("id, title_en, title_pt, description_en, price, currency, stripe_price_id")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error || !product) throw new Error("Academy item not found");
      
      productName = product.title_en;
      productDescription = product.description_en || `Access to: ${product.title_en}`;
      price = product.price;
      currency = product.currency;
      stripePriceId = product.stripe_price_id;
      successPath = `/learn/course/${productId}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      logStep("Academy item found", { title: productName, price });

    } else if (productType === "premium_offer") {
      const { data: product, error } = await supabaseClient
        .from("premium_offers")
        .select("id, title_en, title_pt, subtitle_en, price, currency, stripe_price_id, billing_type")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error || !product) throw new Error("Premium offer not found");
      
      productName = product.title_en;
      productDescription = product.subtitle_en || `Premium: ${product.title_en}`;
      price = product.price;
      currency = product.currency;
      stripePriceId = product.stripe_price_id;
      successPath = `/learn?type=store&payment=success&session_id={CHECKOUT_SESSION_ID}`;
      logStep("Premium offer found", { title: productName, price });

    } else if (productType === "store_item") {
      const { data: product, error } = await supabaseClient
        .from("store_items")
        .select("id, name_en, name_pt, description_en, price, currency, stripe_price_id")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error || !product) throw new Error("Store item not found");
      
      productName = product.name_en;
      productDescription = product.description_en || `Product: ${product.name_en}`;
      price = product.price;
      currency = product.currency;
      stripePriceId = product.stripe_price_id;
      successPath = `/learn?type=store&payment=success&session_id={CHECKOUT_SESSION_ID}`;
      logStep("Store item found", { name: productName, price });

    } else {
      throw new Error(`Invalid product type: ${productType}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists (only for authenticated users)
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://saralucasacademy.lovable.app";
    
    // Build metadata
    const metadata: Record<string, string> = {
      product_id: productId,
      product_type: productType,
      is_guest: guestCheckout ? "true" : "false",
    };
    if (userId) {
      metadata.user_id = userId;
    }

    // Build line items - use existing Stripe price if available, otherwise create dynamic
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    
    if (stripePriceId) {
      // Use pre-configured Stripe price
      lineItems = [{
        price: stripePriceId,
        quantity: 1,
      }];
      logStep("Using existing Stripe price", { stripePriceId });
    } else {
      // Create dynamic price (fallback)
      lineItems = [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: productName,
            description: productDescription,
            metadata: { product_id: productId, product_type: productType },
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }];
      logStep("Using dynamic price", { price, currency });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (userEmail || undefined),
      customer_creation: guestCheckout ? "always" : undefined,
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["card", "mb_way", "klarna"],
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}/learn?type=store&payment=canceled`,
      metadata,
    });

    logStep("Checkout session created", { sessionId: session.id, isGuest: guestCheckout });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
