import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MP_CLIENT_ID = Deno.env.get('MERCADO_PAGO_CLIENT_ID')!;
const MP_CLIENT_SECRET = Deno.env.get('MERCADO_PAGO_CLIENT_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DASHBOARD_URL = Deno.env.get('DASHBOARD_URL') || 'https://nexora-dashboard.vercel.app';

serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  
  // We pass user_id and store_id inside the state param: "userId|storeId"
  const stateStr = url.searchParams.get('state') || '';
  const [userId, storeId] = stateStr.split('|');

  if (!code || !userId) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${DASHBOARD_URL}?mp_error=missing_params` }
    });
  }

  try {
    // 1. Exchange code for access_token
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: MP_CLIENT_ID,
        client_secret: MP_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${SUPABASE_URL}/functions/v1/mp-oauth-callback`
      })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('MP token exchange error:', err);
      // Ensure we redirect instead of showing raw error
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${DASHBOARD_URL}?mp_error=token_exchange_failed&detail=${encodeURIComponent(err)}` }
      });
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, user_id: mpUserId, expires_in } = tokenData;

    // 2. Fetch user info from MP
    const userRes = await fetch(`https://api.mercadopago.com/users/${mpUserId}`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const mpUser = userRes.ok ? await userRes.json() : {};

    // 3. Save to Supabase using service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('payment_integrations')
      .upsert({
        user_id: userId,
        store_id: storeId || null,
        provider: 'mercadopago',
        access_token,
        refresh_token: refresh_token || null,
        mp_user_id: String(mpUserId),
        mp_email: mpUser.email || null,
        mp_nickname: mpUser.nickname || null,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${DASHBOARD_URL}?mp_error=db_save_failed` }
      });
    }

    // 4. Redirect back to dashboard with success
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${DASHBOARD_URL}?mp_connected=1` }
    });

  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${DASHBOARD_URL}?mp_error=unexpected` }
    });
  }
});
