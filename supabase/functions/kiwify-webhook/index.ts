import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kiwify-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Kiwify Webhook received:", JSON.stringify(body, null, 2));

    // Kiwify order statuses: approved, rejected, refunded, chargeback, etc.
    const order_status = body.order_status;
    const customer = body.customer;
    const product_name = body.product_name;
    const amount = body.amount;
    
    // Attempt to get user_id from custom parameters or top-level keys
    const user_id = body.custom_parameters?.user_id || body.user_id;

    if (!user_id && !customer?.email) {
      console.error("No user_id or email found in webhook payload");
      return new Response(JSON.stringify({ error: "No user identification" }), { status: 400 });
    }

    let finalUserId = user_id;

    // Lookup by email if no user_id found
    if (!finalUserId && customer?.email) {
      // Note: This requires the users table to be queryable by service role.
      // Since we don't have a direct users view, we use the user_id that should be in metadata/URL params
      // Or we can query the public.stores table if we assume 1 store per user initially
      const { data: storeData } = await supabaseClient
        .from("stores")
        .select("user_id")
        .eq("email", customer.email)
        .single();
        
      if (storeData) finalUserId = storeData.user_id;
    }

    if (!finalUserId) {
      console.error(`Could not find user for identification.`);
      // We return 200 anyway to stop Kiwify retries if we really can't find the user, 
      // but log the error for manual fix.
      return new Response(JSON.stringify({ error: "User not found" }), { status: 200 });
    }

    if (order_status === "paid" || order_status === "approved") {
      const planName = product_name?.includes("Básico") ? "Básico" : 
                       product_name?.includes("Profissional") ? "Profissional" : 
                       product_name?.includes("Premium") ? "Premium" : "Básico";

      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      const { error: upsertError } = await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: finalUserId,
          plan_name: planName,
          price: amount ? amount / 100 : 0, 
          billing_cycle: "monthly",
          payment_gateway: "kiwify",
          status: "active",
          kiwify_order_id: body.order_id,
          renewal_date: renewalDate.toISOString(),
        }, { onConflict: "user_id" });

      if (upsertError) throw upsertError;
      console.log(`Subscription activated for user ${finalUserId}`);
    } else if (order_status === "refunded" || order_status === "chargeback") {
      await supabaseClient
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("user_id", finalUserId);
      console.log(`Subscription deactivated for user ${finalUserId}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 to prevent Kiwify from retrying infinitely on logic errors
    });
  }
});
