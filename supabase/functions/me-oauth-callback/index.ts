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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // This should contain the store_id

    if (!code || !state) {
      return new Response("Missing code or state", { status: 400 });
    }

    const store_id = state;

    const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
    const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");
    const redirectUri = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI");

    console.log(`[OAuth] Config check:
      clientId: ${clientId ? clientId.substring(0, 5) + '...' : 'MISSING'}
      clientSecret: ${clientSecret ? 'PRESENT' : 'MISSING'}
      redirectUri: ${redirectUri || 'MISSING'}
    `);

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("[OAuth] Missing mandatory environment variables");
      throw new Error("Melhor Envio environment variables not configured in Supabase.");
    }

    // Exchange code for tokens
    console.log(`[OAuth] Attempting token exchange with code: ${code.substring(0, 5)}...`);
    
    const tokenResponse = await fetch("https://melhorenvio.com.br/oauth/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorBody;
      try {
        errorBody = JSON.parse(errorText);
      } catch (e) {
        errorBody = { message: errorText };
      }
      
      console.error("[OAuth] Token exchange failed:", errorBody);
      
      // Map common OAuth errors to user-friendly messages
      let userMessage = "Falha na autenticação com Melhor Envio.";
      if (errorBody.error === "invalid_client") {
        userMessage = "Configuração de Client ID ou Secret inválida no servidor. Verifique os segredos no Supabase.";
      } else if (errorBody.error === "invalid_grant") {
        userMessage = "O código de autorização expirou ou já foi utilizado. Tente novamente.";
      }
      
      throw new Error(userMessage);
    }

    const tokens = await tokenResponse.json();
    console.log("[OAuth] Tokens received successfully");

    // Get user info to save email/name
    const userResponse = await fetch("https://melhorenvio.com.br/api/v2/me", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error("[OAuth] Failed to fetch user info");
      throw new Error("Falha ao obter informações do usuário do Melhor Envio.");
    }

    const userInfo = await userResponse.json();

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save tokens
    console.log(`[OAuth] Saving integration for store: ${store_id}`);
    const { error: upsertError } = await supabase
      .from("me_store_integrations")
      .upsert({
        store_id: store_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        me_user_id: userInfo.id?.toString(),
        me_email: userInfo.email,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id' });

    if (upsertError) {
      console.error("[OAuth] Database upsert error:", upsertError);
      throw upsertError;
    }

    // Redirect back to dashboard
    const dashboardUrl = Deno.env.get("DASHBOARD_URL") || "https://nexlyra.vercel.app";
    return Response.redirect(`${dashboardUrl}?me_success=true`, 302);

  } catch (error: any) {
    console.error("[OAuth] Fatal Error:", error.message);
    const dashboardUrl = Deno.env.get("DASHBOARD_URL") || "https://nexlyra.vercel.app";
    // Ensure we always redirect with an error param
    return Response.redirect(`${dashboardUrl}?me_error=true&message=${encodeURIComponent(error.message)}`, 302);
  }
});
