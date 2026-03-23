import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { store_id, amount, title, quantity = 1, payer_email, payment_method_id, order_id } = body;

    if (!store_id || !amount || !title) {
      return new Response(JSON.stringify({ error: 'Missing required fields: store_id, amount, title' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Get access_token for this store (server-side only, never exposed to frontend)
    const { data: integration, error: integError } = await supabase
      .from('payment_integrations')
      .select('access_token, mp_user_id')
      .eq('store_id', store_id)
      .eq('provider', 'mercadopago')
      .single();

    if (integError || !integration) {
      return new Response(JSON.stringify({ error: 'Store has no Mercado Pago connection configured' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { access_token } = integration;

    // 3. Create preference in MP
    const preference = {
      items: [{ title, quantity, unit_price: Number(amount) }],
      payer: payer_email ? { email: payer_email } : undefined,
      external_reference: order_id || String(Date.now()),
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: Deno.env.get('DASHBOARD_URL') + '/success',
        failure: Deno.env.get('DASHBOARD_URL') + '/failure',
        pending: Deno.env.get('DASHBOARD_URL') + '/pending'
      },
      auto_return: 'approved'
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    if (!mpRes.ok) {
      const mpError = await mpRes.text();
      console.error('MP preference error:', mpError);
      return new Response(JSON.stringify({ error: 'Failed to create payment preference', detail: mpError }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const mpData = await mpRes.json();

    return new Response(JSON.stringify({
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('mp-create-payment error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
