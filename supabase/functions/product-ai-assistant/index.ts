import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Gemini API Error:", errorData);
      throw new Error("Failed to communicate with AI");
    }

    const data = await geminiResponse.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("AI returned empty response");
    }

    // Attempt to extract JSON from potentially markdown-wrapped response
    textResponse = textResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

    try {
      const jsonResponse = JSON.parse(textResponse);
      return new Response(JSON.stringify(jsonResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Failed to parse AI JSON:", textResponse);
      throw new Error("AI returned invalid JSON format");
    }

  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
