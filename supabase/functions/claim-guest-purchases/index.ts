import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLAIM-GUEST-PURCHASES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Supabase config missing");
    }

    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.slice("Bearer ".length);
    
    // Create client with user's token to get their identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = (claimsData.claims as Record<string, unknown>).email as string;

    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "Missing user info" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("User authenticated", { userId, email: userEmail });

    // Use service role to access guest_purchases and user_purchases
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Find pending guest purchases for this email
    const { data: guestPurchases, error: fetchError } = await adminClient
      .from("guest_purchases")
      .select("*")
      .eq("guest_email", userEmail.toLowerCase())
      .eq("status", "pending");

    if (fetchError) {
      logStep("Error fetching guest purchases", { error: fetchError.message });
      throw new Error(`Failed to fetch guest purchases: ${fetchError.message}`);
    }

    if (!guestPurchases || guestPurchases.length === 0) {
      logStep("No pending guest purchases found");
      return new Response(JSON.stringify({ 
        success: true,
        claimed: 0,
        message: "No pending purchases to claim"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found guest purchases to claim", { count: guestPurchases.length });

    let claimedCount = 0;
    const errors: string[] = [];

    for (const guestPurchase of guestPurchases) {
      try {
        // Create user_purchase record
        const { error: insertError } = await adminClient
          .from("user_purchases")
          .upsert({
            user_id: userId,
            course_id: guestPurchase.course_id,
            payment_method: "stripe",
            payment_reference: guestPurchase.stripe_session_id,
            amount_paid: guestPurchase.amount_paid,
            currency: guestPurchase.currency,
            status: "completed",
          }, {
            onConflict: "user_id,course_id",
          });

        if (insertError) {
          errors.push(`Failed to grant access for course ${guestPurchase.course_id}: ${insertError.message}`);
          continue;
        }

        // Mark guest purchase as claimed
        const { error: updateError } = await adminClient
          .from("guest_purchases")
          .update({
            status: "claimed",
            claimed_at: new Date().toISOString(),
            claimed_by: userId,
          })
          .eq("id", guestPurchase.id);

        if (updateError) {
          errors.push(`Failed to update guest purchase ${guestPurchase.id}: ${updateError.message}`);
          continue;
        }

        claimedCount++;
        logStep("Claimed purchase", { guestPurchaseId: guestPurchase.id, courseId: guestPurchase.course_id });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        errors.push(`Error processing purchase ${guestPurchase.id}: ${errorMsg}`);
      }
    }

    logStep("Claim process completed", { claimed: claimedCount, errors: errors.length });

    return new Response(JSON.stringify({ 
      success: true,
      claimed: claimedCount,
      total: guestPurchases.length,
      errors: errors.length > 0 ? errors : undefined,
      message: claimedCount > 0 
        ? `Successfully granted access to ${claimedCount} course(s)!`
        : "No purchases were claimed"
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
