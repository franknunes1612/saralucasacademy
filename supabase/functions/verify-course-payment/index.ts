import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-COURSE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase config missing");

    // Use service role to write to user_purchases and guest_purchases
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Parse request body
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve session with customer details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer"],
    });

    logStep("Session retrieved", { 
      status: session.status, 
      paymentStatus: session.payment_status,
      userId: session.metadata?.user_id,
      courseId: session.metadata?.course_id,
      isGuest: session.metadata?.is_guest,
      customerEmail: session.customer_details?.email,
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;
    const isGuest = session.metadata?.is_guest === "true";
    const customerEmail = session.customer_details?.email;

    if (!courseId) {
      throw new Error("Missing course_id in session metadata");
    }

    // Handle guest checkout - store in guest_purchases table
    if (isGuest || !userId) {
      if (!customerEmail) {
        throw new Error("Missing customer email for guest purchase");
      }

      logStep("Processing guest purchase", { email: customerEmail, courseId });

      // Store guest purchase for later claim
      const { data: guestPurchase, error: guestError } = await supabaseClient
        .from("guest_purchases")
        .upsert({
          guest_email: customerEmail.toLowerCase(),
          course_id: courseId,
          stripe_session_id: session.id,
          amount_paid: session.amount_total ? session.amount_total / 100 : null,
          currency: session.currency?.toUpperCase() || "EUR",
          status: "pending",
        }, {
          onConflict: "stripe_session_id",
        })
        .select()
        .single();

      if (guestError) {
        logStep("Error storing guest purchase", { error: guestError.message });
        throw new Error(`Failed to store guest purchase: ${guestError.message}`);
      }

      logStep("Guest purchase stored successfully", { 
        purchaseId: guestPurchase.id,
        email: customerEmail,
      });

      return new Response(JSON.stringify({ 
        success: true,
        isGuest: true,
        guestPurchase: {
          id: guestPurchase.id,
          course_id: guestPurchase.course_id,
          email: customerEmail,
          status: guestPurchase.status,
        },
        message: "Purchase recorded. Please create an account or log in with this email to access your course."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle authenticated user purchase
    logStep("Processing authenticated user purchase", { userId, courseId });

    // Grant access by inserting into user_purchases
    const { data: purchase, error: insertError } = await supabaseClient
      .from("user_purchases")
      .upsert({
        user_id: userId,
        course_id: courseId,
        payment_method: "stripe",
        payment_reference: session.id,
        amount_paid: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency?.toUpperCase() || "EUR",
        status: "completed",
      }, {
        onConflict: "user_id,course_id",
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error inserting purchase", { error: insertError.message });
      throw new Error(`Failed to grant access: ${insertError.message}`);
    }

    logStep("Access granted successfully", { purchaseId: purchase.id });

    return new Response(JSON.stringify({ 
      success: true,
      isGuest: false,
      purchase: {
        id: purchase.id,
        course_id: purchase.course_id,
        status: purchase.status,
      }
    }), {
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
