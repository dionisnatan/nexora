import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function getValidMeToken(supabase: any, storeId: string) {
  // 1. Fetch current token
  const { data: integration, error } = await supabase
    .from('me_store_integrations')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error || !integration) {
    throw new Error("Loja não possui integração ativa com Melhor Envio.");
  }

  const now = new Date();
  const expiresAt = new Date(integration.expires_at);

  // If token is still valid (with 5 min buffer), return it
  if (expiresAt.getTime() > now.getTime() + 5 * 60 * 1000) {
    return integration.access_token;
  }

  // 2. Token expired, try to refresh
  console.log(`[ME-Refresh] Token expired for store ${storeId}. Refreshing...`);
  
  const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
  const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");
  const redirectUri = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI");

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do Melhor Envio não configuradas no servidor.");
  }

  try {
    const response = await fetch("https://melhorenvio.com.br/oauth/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: integration.refresh_token,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[ME-Refresh] Refresh failed:", errBody);
      throw new Error("Falha ao atualizar token do Melhor Envio. Por favor, reconecte sua conta.");
    }

    const tokens = await response.json();

    // 3. Save new tokens
    const { error: updateError } = await supabase
      .from("me_store_integrations")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', storeId);

    if (updateError) throw updateError;

    console.log(`[ME-Refresh] Token refreshed successfully for store ${storeId}`);
    return tokens.access_token;

  } catch (error: any) {
    console.error("[ME-Refresh] Error:", error.message);
    throw error;
  }
}
