import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-COURSE-CHECKOUT] ${step}${detailsStr}`);
};

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

    // Parse request body first to check for guest checkout
    const { courseId, guestCheckout } = await req.json();
    if (!courseId) throw new Error("Course ID is required");
    logStep("Request parsed", { courseId, guestCheckout });

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

    // For guest checkout, user remains unauthenticated
    if (guestCheckout) {
      logStep("Guest checkout mode - no user authentication required");
    }

    // Create a basic Supabase client for course lookup
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // Fetch course details from database
    const { data: course, error: courseError } = await supabaseClient
      .from("academy_items")
      .select("id, title_en, title_pt, price, currency")
      .eq("id", courseId)
      .eq("is_active", true)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }
    logStep("Course found", { title: course.title_en, price: course.price });

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
    
    // Build metadata - include user_id only if authenticated
    const metadata: Record<string, string> = {
      course_id: course.id,
      is_guest: guestCheckout ? "true" : "false",
    };
    if (userId) {
      metadata.user_id = userId;
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (userEmail || undefined),
      // For guest checkout, Stripe will collect email on checkout page
      customer_creation: guestCheckout ? "always" : undefined,
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase(),
            product_data: {
              name: course.title_en,
              description: `Course access: ${course.title_en}`,
              metadata: {
                course_id: course.id,
              },
            },
            unit_amount: Math.round(course.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card", "mb_way"],
      success_url: `${origin}/learn/course/${courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/learn/course/${courseId}?payment=canceled`,
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
