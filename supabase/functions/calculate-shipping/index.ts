import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getValidMeToken } from "../_shared/me-tokens.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { cep_destino, products, store_id, from_cep } = await req.json();

    if (!cep_destino) {
      return new Response(JSON.stringify({ error: "CEP de destino não informado." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client to fetch store settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let melhorEnvioToken = Deno.env.get("MELHOR_ENVIO_TOKEN");
    let cepOrigem = from_cep || Deno.env.get("MELHOR_ENVIO_CEP_ORIGEM") || "01000-000";

    // If store_id is provided, try to get store-specific token (with auto-refresh)
    if (store_id) {
      try {
        melhorEnvioToken = await getValidMeToken(supabase, store_id);
      } catch (e) {
        console.warn(`[Shipping] Could not get store-specific token for ${store_id}:`, e.message);
        // Fallback to global token if available, otherwise it will fail below
      }
    }

    if (!melhorEnvioToken) {
      return new Response(JSON.stringify({ error: "Token do Melhor Envio não configurado para esta loja." }), {
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

    console.log(`Calculating shipping for store ${store_id} from ${cepOrigem} to ${cep_destino}`);

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

