import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { url, fallbackSeed } = await req.json();
    if (!url) throw new Error("URL is required");

    // SSRF Protection: Whitelist allowed domains
    const allowedDomains = [
      'pollinations.ai',
      'image.pollinations.ai',
      'loremflickr.com',
    ];

    try {
      const parsedUrl = new URL(url);
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
      );

      if (!isAllowed) {
        console.warn("[proxy-image] Blocked unauthorized domain:", parsedUrl.hostname);
        throw new Error("Domain not allowed");
      }
    } catch (e) {
      if (e.message === "Domain not allowed") throw e;
      throw new Error("Invalid URL format");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase config is missing in Edge Function environment.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[proxy-image] fetching:", url);

    let response;
    let usedFallback = false;

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      
      if (!response.ok) throw new Error("AI service returned " + response.status);
    } catch (e) {
      console.warn("[proxy-image] AI failed, trying stable photo...", e.message);
      const fallbackUrl = `https://loremflickr.com/800/800/${encodeURIComponent(fallbackSeed || 'product')}`;
      response = await fetch(fallbackUrl);
      usedFallback = true;
    }

    if (!response || !response.ok) throw new Error("All image services failed");

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    // Generate a unique path in the public storage
    const fileName = `ai-gen-${Date.now()}.jpg`;
    const filePath = `temp/${fileName}`;

    console.log("[proxy-image] uploading to storage:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store_assets')
      .upload(filePath, arrayBuffer, {
        contentType: contentType,
        upsert: true
      });

    if (uploadError) {
      console.error("[proxy-image] storage upload error:", uploadError);
      throw new Error("Failed to upload image to storage: " + uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('store_assets')
      .getPublicUrl(filePath);

    return new Response(JSON.stringify({ 
      publicUrl,
      isFallback: usedFallback
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[proxy-image] fatal error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    });
  }
});
