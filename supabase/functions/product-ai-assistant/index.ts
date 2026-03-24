import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateWithGemini(apiKey: string, systemPrompt: string, signal: AbortSignal): Promise<string> {
  const model = 'gemini-2.0-flash-lite';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.7 }
    }),
    signal
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedError = errText;
    try {
      const jp = JSON.parse(errText);
      parsedError = jp.error?.message || errText;
    } catch(e) {}
    throw new Error(`Google API (${model}): ${parsedError}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  if (!textResponse) {
    throw new Error("Google API retornou resposta vazia");
  }
  return textResponse;
}

async function generateWithGroq(apiKey: string, systemPrompt: string, signal: AbortSignal): Promise<string> {
  const model = 'llama-3.3-70b-versatile';
  const groqUrl = `https://api.groq.com/openai/v1/chat/completions`;

  const response = await fetch(groqUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "Sempre retorne apenas JSON. Sem markdown ou explicações antes ou depois." },
        { role: "user", content: systemPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    }),
    signal
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedError = errText;
    try {
      const jp = JSON.parse(errText);
      parsedError = jp.error?.message || errText;
    } catch(e) {}
    throw new Error(`Groq API (${model}): ${parsedError}`);
  }

  const data = await response.json();
  const textResponse = data.choices?.[0]?.message?.content || "";
  
  if (!textResponse) {
    throw new Error("Groq API retornou resposta vazia");
  }
  return textResponse;
}

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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const groqKey = Deno.env.get('GROQ_API_KEY');

    if (!geminiKey && !groqKey) {
      throw new Error("Nenhuma chave de API configurada (GEMINI_API_KEY ou GROQ_API_KEY). Vá nas configurações do Edge Function e insira ao menos uma chave.");
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

    let textResponse = "";
    let lastError = "";

    // Fallback Logic
    // Step 1: Try Gemini if key exists
    if (geminiKey) {
      try {
        textResponse = await generateWithGemini(geminiKey, systemPrompt, controller.signal);
      } catch (e: any) {
        lastError = e?.message || "Falha desconhecida no Gemini";
        console.warn(`Gemini falhou: ${lastError}. Tentando fallback pela Groq...`);
      }
    } else {
      lastError = "Chave GEMINI_API_KEY ausente";
    }

    // Step 2: Try Groq if Gemini failed (or was missing key) AND Groq key exists
    if (!textResponse && groqKey) {
      try {
        textResponse = await generateWithGroq(groqKey, systemPrompt, controller.signal);
      } catch (e: any) {
        lastError = `Falha Primária (Gemini): ${lastError} | Falha Fallback (Groq): ${e?.message || "Erro interno"}`;
        console.error("Ambos os modelos falharam:", lastError);
      }
    } else if (!textResponse && !groqKey) {
       lastError = `${lastError} | Aviso: Fallback via Groq desativado pois a GROQ_API_KEY não está configurada no Supabase.`;
    }

    clearTimeout(globalTimeout);

    if (!textResponse) {
      if (controller.signal.aborted) {
        throw new Error("A Inteligência Artificial (Gemini/Groq) demorou muito para responder e esgotou o tempo limite de 9s.");
      }
      throw new Error(`As IA's falharam em responder. Detalhes: ${lastError}`);
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
      throw new Error("A IA retornou um formato de resposta (JSON) inválido. Tente novamente.");
    }

  } catch (error: any) {
    clearTimeout(globalTimeout);
    console.error("Error Response:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Internal Server Error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
