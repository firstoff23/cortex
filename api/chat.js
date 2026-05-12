const PROD_ORIGIN = "https://cortex-five-hazel.vercel.app";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const FREE_FALLBACKS = [
  "google/gemma-3-4b-it:free",
  "google/gemma-3n-e4b-it:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

export const config = {
  maxDuration: 30,
};

function aplicarCors(req, res) {
  const origin = req.headers?.origin || "";
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function erroCamposObrigatorios(res) {
  return res.status(400).json({ error: "Campos obrigatórios: model, messages" });
}

function lerOpenRouterKey() {
  const key = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
  console.log('[chat.js] OPENROUTER_KEY presente:', !!process.env.OPENROUTER_KEY);
  console.log('[chat.js] OPENROUTER_API_KEY presente:', !!process.env.OPENROUTER_API_KEY);
  console.log('[chat.js] Key resolvida (primeiros 8):', key ? key.slice(0, 8) + '...' : 'VAZIA');
  return key;
}

async function lerJsonSeguro(upstream) {
  try {
    return await upstream.json();
  } catch {
    return {};
  }
}

async function chamarOpenRouterUmaVez(model, payload, apiKey) {
  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": PROD_ORIGIN,
      "X-Title": "Córtex Digital",
    },
    body: JSON.stringify({ ...payload, model }),
  });

  return {
    status: upstream.status,
    ok: upstream.ok,
    dados: await lerJsonSeguro(upstream),
  };
}

async function chamarOpenRouter({ model, system, messages, max_tokens }) {
  const apiKey = lerOpenRouterKey();
  if (!apiKey) {
    return {
      status: 500,
      body: { error: "OPENROUTER_KEY/OPENROUTER_API_KEY não configurada" },
    };
  }

  const payload = {
    max_tokens: max_tokens || 420,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
  };

  // Modelos gratuitos costumam desaparecer; o proxy tenta alternativas no servidor.
  const modelos = model.endsWith(":free")
    ? [model, ...FREE_FALLBACKS.filter((m) => m !== model)]
    : [model];

  let ultimoErro = null;
  let ultimoStatus = 502;
  for (const modeloAtual of modelos) {
    const { status, ok, dados } = await chamarOpenRouterUmaVez(modeloAtual, payload, apiKey);
    ultimoStatus = status;
    ultimoErro = dados;
    if (ok && !dados.error && dados.choices?.[0]) {
      const choice = dados.choices[0];
      return {
        status: 200,
        body: {
          content: choice.message?.content || "",
          model: dados.model || modeloAtual,
          provider: "openrouter",
          usage: dados.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        },
      };
    }
  }

  return {
    status: 502,
    body: {
      error: "OpenRouter devolveu erro",
      status: ultimoStatus,
      detail: JSON.stringify(ultimoErro),
    },
  };
}

export default async function handler(req, res) {
  aplicarCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { model, messages, system, max_tokens } = req.body || {};
  if (typeof model !== "string" || !model.trim() || !Array.isArray(messages)) {
    return erroCamposObrigatorios(res);
  }

  try {
    const resultado = await chamarOpenRouter({
      model: model.trim(),
      system,
      messages,
      max_tokens,
    });

    return res.status(resultado.status).json(resultado.body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
