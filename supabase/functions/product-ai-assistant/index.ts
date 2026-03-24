import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const controller = new AbortController();
  const globalTimeout = setTimeout(() => controller.abort(), 9000);

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não está configurada.");
    }

    const systemPrompt = `Você é uma Inteligência Artificial especializada em e-commerce e criação de produtos digitais e físicos para lojas online.
Seu objetivo é ajudar vendedores a criar páginas de produtos profissionais que aumentem conversões e vendas.
Sempre gere conteúdos claros, persuasivos e otimizados para vendas com base no prompt passado.
Informações recebidas do lojista (prompt): "${prompt}"
Você deve retornar APENAS um JSON válido e perfeitamente formatado, com as seguintes chaves exatas (em string):
{
  "name": "Título profissional e otimizado para SEO com até 60 caracteres",
  "description": "Uma descrição profissional, atrativa e persuasiva. Deve conter introdução, benefícios e motivos para comprar. Formatada com parágrafos e sem emojis.",
  "technical_info": "Especificações técnicas sugeridas para o produto. Liste em formato de texto coerente.",
  "informative_info": "Informações adicionais úteis (ex: garantia sugerida, envio, características premium).",
  "suggested_price": "Um valor sugerido em reais (apenas números e ponto, ex: 149.90)",
  "image_prompt": "Prompt em inglês para geração de foto do produto, ex: 'Product photography of [produto], studio lighting, white background, ultra realistic, high detail, ecommerce style'"
}
Lembre-se: Retorne APENAS um bloco puro de código JSON bruto. Sem marcação Markdown ou comentários.`;

    const model = 'gemini-2.0-flash-lite';
    let lastError = "";
    let textResponse = "";

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7 }
        }),
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        const errText = await response.text();
        let parsedError = errText;
        try {
          const jp = JSON.parse(errText);
          parsedError = jp.error?.message || errText;
        } catch(e) {}
        lastError = parsedError;
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw new Error("O Google AI (Gemini) está demorando muito para responder.");
      }
      lastError = e.message;
    }

    clearTimeout(globalTimeout);

    if (!textResponse) {
      throw new Error(`A IA falhou em responder. Erro da API do Google (${model}): ${lastError}`);
    }

    let cleanJson = textResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const jsonStart = cleanJson.indexOf('{');
    const jsonEnd = cleanJson.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
    }

    try {
      const jsonResponse = JSON.parse(cleanJson);
      return new Response(JSON.stringify(jsonResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Failed to parse AI JSON:", cleanJson);
      throw new Error("A IA retornou um formato inválido. Tente novamente.");
    }

  } catch (error: any) {
    clearTimeout(globalTimeout);
    console.error("Error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Internal Server Error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
