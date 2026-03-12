// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

console.log("Mercado Pago Webhook function started");

serve(async (req: Request) => {
  const { method } = req;

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      } 
    });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Handle regular payments
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
      });

      if (mpResponse.ok) {
        const paymentData = await mpResponse.json();
        console.log('Payment details:', JSON.stringify(paymentData, null, 2));

        if (paymentData.status === 'approved') {
          await updateSubscription(supabase, {
            user_id: paymentData.external_reference,
            plan_name: paymentData.description,
            price: paymentData.transaction_amount,
            billing_cycle: paymentData.metadata?.billing_cycle || 'monthly',
            mercadopago_payment_id: paymentId
          });
        }
      }
    } 
    // 2. Handle subscription pre-approvals (recurring)
    else if (body.type === 'subscription_preapproval' && body.data?.id) {
      const preapprovalId = body.data.id;
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { 'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
      });

      if (mpResponse.ok) {
        const preapprovalData = await mpResponse.json();
        console.log('Pre-approval details:', JSON.stringify(preapprovalData, null, 2));

        if (preapprovalData.status === 'authorized') {
          await updateSubscription(supabase, {
            user_id: preapprovalData.external_reference,
            plan_name: preapprovalData.reason,
            price: preapprovalData.auto_recurring?.transaction_amount,
            billing_cycle: preapprovalData.auto_recurring?.frequency_type === 'months' ? 'monthly' : 'yearly',
            mercadopago_payment_id: preapprovalId
          });
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Webhook processed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Webhook error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})

async function updateSubscription(supabase: any, data: any) {
  const { user_id, plan_name, price, billing_cycle, mercadopago_payment_id } = data;
  
  const renewalDate = new Date();
  if (billing_cycle === 'monthly') {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id,
      plan_name,
      price,
      billing_cycle,
      payment_gateway: 'mercadopago',
      status: 'active',
      renewal_date: renewalDate.toISOString(),
      mercadopago_payment_id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw error;
  console.log(`Successfully activated subscription for user: ${user_id}`);
}
