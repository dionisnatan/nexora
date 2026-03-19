import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { cep_destino, products } = await req.json();

    if (!cep_destino) {
      return new Response(JSON.stringify({ error: "CEP de destino não informado." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cepOrigem = Deno.env.get("MELHOR_ENVIO_CEP_ORIGEM") || "01000-000";
    const melhorEnvioToken = Deno.env.get("MELHOR_ENVIO_TOKEN");

    if (!melhorEnvioToken) {
      return new Response(JSON.stringify({ error: "Token do Melhor Envio não configurado." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default package if no products are provided or if they lack valid dimensions
    let packageInfo;
    
    // Simplification for the payload: if we have products, map them
    if (products && products.length > 0) {
      packageInfo = products.map((p: any) => ({
        id: p.id || "1",
        width: Number(p.width) || 11,
        height: Number(p.height) || 11,
        length: Number(p.length) || 16,
        weight: Number(p.weight) || 0.3,
        insurance_value: Number(p.price) || 0,
        quantity: Number(p.quantity) || 1
      }));
    } else {
      // Minimum standard box for Correios
      packageInfo = [{
        id: "default",
        width: 11,
        height: 11,
        length: 16,
        weight: 0.3,
        insurance_value: 0,
        quantity: 1
      }];
    }

    const payload = {
      from: {
        postal_code: cepOrigem.replace(/\D/g, '')
      },
      to: {
        postal_code: cep_destino.replace(/\D/g, '')
      },
      products: packageInfo
    };

    const response = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${melhorEnvioToken}`,
        "User-Agent": "Nexora Dashboard Storefront"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Melhor Envio API Error:", errorText);
      throw new Error(`Erro API Melhor Envio: ${errorText}`);
    }

    const data = await response.json();

    // The API returns an array of services. Filter out those with errors and format.
    const availableOptions = data
      .filter((option: any) => !option.error)
      .map((option: any) => ({
        id: option.id,
        name: option.name,
        company: option.company.name,
        price: parseFloat(option.price),
        days: option.delivery_time
      }));

    return new Response(JSON.stringify({ options: availableOptions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Shipping calculation error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
