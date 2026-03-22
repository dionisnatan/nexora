import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, storeId } = await req.json();
    console.log(`[Buy Shipping] Processing order ${orderId} for store ${storeId}`);

    if (!orderId || !storeId) {
      throw new Error("Missing orderId or storeId");
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch store integration token
    const { data: storeIntegration, error: integrationError } = await supabase
      .from('me_store_integrations')
      .select('access_token')
      .eq('store_id', storeId)
      .single();

    if (integrationError || !storeIntegration?.access_token) {
      console.error("[Buy Shipping] Integration error:", integrationError);
      throw new Error("Loja não possui integração ativa com Melhor Envio.");
    }

    const meToken = storeIntegration.access_token;
    console.log("[Buy Shipping] Store token retrieved");

    // 2. Fetch order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, stores(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Pedido não encontrado.");
    }

    if (!order.shipping || !order.shipping.id) {
      throw new Error("Este pedido não possui um serviço de frete selecionado.");
    }

    // 3. Prepare payload for Melhor Envio Cart
    // Receiver Info (Customer)
    // Receiver Info (Customer)
    const addressStr = order.address || "";
    const cepMatch = addressStr.match(/CEP:\s*(\d{5}-?\d{3})/);
    const cep = order.shipping?.cep?.replace(/\D/g, '') || cepMatch?.[1]?.replace(/\D/g, '');
    
    // Improved parsing for Bairro, Cidade, UF from address string if possible
    // format: "End: ... | Nº: ... | Comp: ... | Bairro: ... | Cidade-UF | CEP: ..."
    const districtMatch = addressStr.match(/Bairro:\s*([^|]+)/);
    const cityStateMatch = addressStr.match(/([^|]+)-([A-Z]{2})/); // Example: "São Paulo-SP"

    const receiver = {
      name: order.customer_name,
      phone: order.customer_whatsapp?.replace(/\D/g, ''),
      email: order.customer_email || 'cliente@exemplo.com',
      postal_code: cep,
      address: addressStr.match(/End:\s*([^|]+)/)?.[1]?.trim() || addressStr.split('|')[0]?.replace('End: ', '')?.trim() || 'Rua não informada',
      number: addressStr.match(/Nº:\s*([^|]+)/)?.[1]?.trim() || 'S/N',
      district: districtMatch?.[1]?.trim() || 'Centro',
      city: cityStateMatch?.[1]?.trim() || 'Cidade',
      state_abbr: cityStateMatch?.[2]?.trim() || 'SP'
    };

    // If address is JSON in the future, it will be better. Using heuristics for now.
    // Try to parse address if it's stored in a structured way or fallback.

    // Sender Info (Store)
    const sender = {
      name: order.stores?.name,
      phone: order.stores?.whatsapp?.replace(/\D/g, '') || '11999999999',
      email: order.stores?.email || 'loja@exemplo.com',
      postal_code: order.stores?.origin_cep?.replace(/\D/g, ''),
      address: 'Rua da Loja', // These should ideally be in store settings
      number: '1',
      district: 'Centro',
      city: 'São Paulo',
      state_abbr: 'SP'
    };

    // Products
    const products = order.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unitary_value: item.price
    }));

    // Package dimensions (Fallback to defaults if not present)
    const volumes = [{
      width: Number(order.items[0]?.width) || 11,
      height: Number(order.items[0]?.height) || 11,
      length: Number(order.items[0]?.length) || 16,
      weight: Number(order.items[0]?.weight) || 0.3
    }];

    const cartPayload = {
      service: order.shipping.id,
      agency: null,
      from: sender,
      to: receiver,
      products: products,
      volumes: volumes,
      options: {
        insurance_value: order.total,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true
      }
    };

    // --- EXECUTE MELHOR ENVIO STEPS ---

    // A. Add to Cart
    const cartRes = await fetch("https://melhorenvio.com.br/api/v2/me/cart", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${meToken}`,
      },
      body: JSON.stringify(cartPayload)
    });

    if (!cartRes.ok) {
      const err = await cartRes.text();
      console.error("[Buy Shipping] Cart error:", err);
      throw new Error(`Erro ao adicionar ao carrinho ME: ${err}`);
    }

    const cartItem = await cartRes.json();
    const meOrderId = cartItem.id;

    // B. Checkout
    const checkoutRes = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/checkout", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${meToken}`,
      },
      body: JSON.stringify({ orders: [meOrderId] })
    });

    if (!checkoutRes.ok) {
        const err = await checkoutRes.text();
        console.error("[Buy Shipping] Checkout error:", err);
        // Order stayed in cart but checkout failed (maybe insufficient balance)
        await supabase.from('orders').update({ me_order_id: meOrderId }).eq('id', orderId);
        throw new Error(`Etiqueta adicionada ao carrinho, mas falha no pagamento: ${err}`);
    }

    // C. Generate
    await fetch("https://melhorenvio.com.br/api/v2/me/shipment/generate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${meToken}`,
      },
      body: JSON.stringify({ orders: [meOrderId] })
    });

    // Wait a few seconds for generation
    await new Promise(r => setTimeout(r, 2000));

    // D. Get Details (Tracking Code)
    const detailsRes = await fetch(`https://melhorenvio.com.br/api/v2/me/shipment/tracking`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${meToken}`,
        },
        body: JSON.stringify({ orders: [meOrderId] })
    });
    
    const trackingData = await detailsRes.json();
    const trackingCode = trackingData[meOrderId]?.tracking || null;

    // E. Print URL
    const printRes = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/print", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${meToken}`,
      },
      body: JSON.stringify({ mode: 'pdf', orders: [meOrderId] })
    });

    const printData = await printRes.json();
    const labelUrl = printData.url || null;

    // 4. Update order in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        me_order_id: meOrderId,
        tracking_code: trackingCode,
        shipping_label_url: labelUrl,
        status: 'Enviado'
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 5. Add to order_tracking
    await supabase.from('order_tracking').insert({
      order_id: orderId,
      status: 'Enviado',
      description: `Etiqueta gerada via Melhor Envio. Código de rasteio: ${trackingCode || 'Pendente'}`
    });

    return new Response(JSON.stringify({ 
      success: true, 
      me_order_id: meOrderId,
      tracking_code: trackingCode,
      shipping_label_url: labelUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Buy Shipping Error Detail:", error);
    const statusCode = error.message.includes("Missing") || error.message.includes("não possui") || error.message.includes("encontrado") ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
