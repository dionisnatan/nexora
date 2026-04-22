import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  mapKiwifyProductToPlan,
  normalizePlan,
  LATE_PAYMENT_GRACE_DAYS,
} from "../_shared/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-kiwify-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("x-kiwify-signature");
    const secret = Deno.env.get("KIWIFY_SECRET_TOKEN");

    const bodyText = await req.text();
    
    if (!signature || !secret) {
      console.error("[kiwify-webhook] Missing signature or secret token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 401 
      });
    }

    // Verify HMAC SHA1 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    const hmac = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
    const digest = Array.from(new Uint8Array(hmac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (digest !== signature) {
      console.error("[kiwify-webhook] Invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 401 
      });
    }

    const body = JSON.parse(bodyText);
    console.log("[kiwify-webhook] received verified payload:", JSON.stringify(body, null, 2));

    const order_status: string = body.order_status ?? body.status ?? "";
    const customer = body.customer ?? {};
    const product_name: string = body.product_name ?? body.Product?.name ?? "";
    const amount: number = body.amount ?? 0;

    // Resolve user_id: prefer explicit custom parameter, then lookup by email
    let finalUserId: string | null =
      body.custom_parameters?.user_id ?? body.user_id ?? null;

    if (!finalUserId && customer?.email) {
      // Lookup via profiles table (email field)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customer.email)
        .maybeSingle();

      if (profileData) finalUserId = profileData.id;
    }

    if (!finalUserId) {
      console.warn("[kiwify-webhook] could not resolve user_id, ignoring event");
      // Return 200 to avoid Kiwify retries for unknown users
      return new Response(
        JSON.stringify({ warning: "User not found, event ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ----------------------------------------------------------------
    // Determine which plan this product maps to
    // ----------------------------------------------------------------
    const newPlanKey = mapKiwifyProductToPlan(product_name);

    // Fetch current plan for diff logging
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", finalUserId)
      .maybeSingle();
    const oldPlan = normalizePlan(currentProfile?.plan);

    // ----------------------------------------------------------------
    // Event handling
    // ----------------------------------------------------------------
    const normalizedStatus = order_status.toLowerCase();

    if (normalizedStatus === "paid" || normalizedStatus === "approved" || normalizedStatus === "order_approved") {
      // --- SUBSCRIPTION ACTIVATED ---
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      // 1. Upsert subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: finalUserId,
            plan_name: newPlanKey,
            price: amount ? amount / 100 : 0,
            billing_cycle: "monthly",
            payment_gateway: "kiwify",
            status: "active",
            kiwify_order_id: body.order_id ?? null,
            renewal_date: renewalDate.toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (subError) throw subError;

      // 2. Update profile plan + expiry
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          plan: newPlanKey,
          expires_at: renewalDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", finalUserId);

      if (profileError) throw profileError;

      // 3. Log the change
      await supabase.from("plan_change_logs").insert({
        user_id: finalUserId,
        old_plan: oldPlan,
        new_plan: newPlanKey,
        reason: `order_approved — product: "${product_name}" — kiwify_order_id: ${body.order_id ?? "?"}`,
      });

      console.log(`[kiwify-webhook] ✅ plan activated: user=${finalUserId} plan=${newPlanKey}`);

    } else if (
      normalizedStatus === "subscription_canceled" ||
      normalizedStatus === "refunded" ||
      normalizedStatus === "chargeback" ||
      normalizedStatus === "canceled"
    ) {
      // --- SUBSCRIPTION CANCELED → downgrade to FREE ---
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("user_id", finalUserId);

      if (subError) throw subError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          plan: "free",
          expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", finalUserId);

      if (profileError) throw profileError;

      await supabase.from("plan_change_logs").insert({
        user_id: finalUserId,
        old_plan: oldPlan,
        new_plan: "free",
        reason: `${order_status} — downgrade to FREE`,
      });

      console.log(`[kiwify-webhook] ↘️  plan canceled: user=${finalUserId} downgraded to FREE`);

    } else if (normalizedStatus === "subscription_late" || normalizedStatus === "past_due") {
      // --- PAYMENT LATE → grace period ---
      const graceUntil = new Date();
      graceUntil.setDate(graceUntil.getDate() + LATE_PAYMENT_GRACE_DAYS);

      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("user_id", finalUserId);

      if (subError) throw subError;

      // Keep current plan but set expires_at to grace period end
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          expires_at: graceUntil.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", finalUserId);

      if (profileError) throw profileError;

      await supabase.from("plan_change_logs").insert({
        user_id: finalUserId,
        old_plan: oldPlan,
        new_plan: oldPlan, // plan unchanged, just late
        reason: `subscription_late — grace period until ${graceUntil.toISOString()}`,
      });

      console.log(`[kiwify-webhook] ⚠️  payment late: user=${finalUserId} grace until ${graceUntil.toISOString()}`);

    } else {
      console.log(`[kiwify-webhook] unhandled order_status="${order_status}", skipping`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("[kiwify-webhook] error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      // Return 200 to prevent infinite Kiwify retries on logic errors
      status: 200,
    });
  }
});
