const BASE = "https://openrouter.ai/api/v1/chat/completions";

export const OR_MODELS = {
  "analista-critico": "deepseek/deepseek-r1:free",
  "inovador-criativo": "google/gemma-3-27b-it:free",
  "pragmatico-tecnico": "mistralai/mistral-small-3.1-24b-instruct:free",
  "generalista": "meta-llama/llama-3.3-70b-instruct:free",
  "advogado-do-diabo": "mistralai/mistral-small-3.1-24b-instruct:free",

  "juiz-factual": "google/gemma-3-12b-it:free",
  "juiz-relevancia": "google/gemma-3-12b-it:free",
  "juiz-coerencia": "meta-llama/llama-3.3-70b-instruct:free",

  grok: "deepseek/deepseek-r1:free",
  gemini: "google/gemma-3-27b-it:free",
  perp: "meta-llama/llama-3.3-70b-instruct:free",
  genspark: "mistralai/mistral-small-3.1-24b-instruct:free",
  manus: "mistralai/mistral-small-3.1-24b-instruct:free",
  openai: "microsoft/phi-4:free",
  deepseek: "deepseek/deepseek-chat-v3-0324:free",
  llama: "meta-llama/llama-3.3-70b-instruct:free",
  mistral: "mistralai/mistral-small-3.1-24b-instruct:free",
  nemotron: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
  claude: "google/gemma-3-27b-it:free",

  default: "google/gemma-3-12b-it:free",
};

const FALLBACKS = [
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-8b:free",
];

const JSON_LOBES = [
  "rei",
  "juiz-factual",
  "juiz-relevancia",
  "juiz-coerencia",
];

const THINK_BLOCK_REGEX = new RegExp("<think>[\\s\\S]*?</think>", "g");

export async function callOpenRouter(
  lobeIdOrModel,
  system,
  userMsg,
  maxTokens = 420,
  signal = null
) {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY || "";

  if (!key || key.length < 10) {
    throw new Error(
      "OPENROUTER_API_KEY não configurada. Adiciona VITE_OPENROUTER_API_KEY no Vercel → Settings → Environment Variables."
    );
  }

  const model =
    OR_MODELS[lobeIdOrModel] ||
    (typeof lobeIdOrModel === "string" && lobeIdOrModel.includes("/")
      ? lobeIdOrModel
      : null) ||
    OR_MODELS.default;

  const isJsonLobe = JSON_LOBES.includes(lobeIdOrModel);

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 25_000);
  const mergedSignal = signal ? mergeSignals(signal, ctrl.signal) : ctrl.signal;

  const payload = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    ...(isJsonLobe
      ? {
          response_format: {
            type: "json_object",
          },
        }
      : {}),
  };

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://cortex-digital.vercel.app",
      "X-Title": "Córtex Digital",
    },
    body: JSON.stringify(payload),
    signal: mergedSignal,
  };

  try {
    const res = await fetch(BASE, opts);
    clearTimeout(tid);

    const data = await res.json();

    if (data.error) {
      const msg =
        typeof data.error === "string"
          ? data.error
          : data.error.message || JSON.stringify(data.error);

      throw new Error(`OpenRouter devolveu erro: ${msg}`);
    }

    if (res.status === 404) {
      throw new Error(`HTTP 404 — model "${model}" não encontrado no OpenRouter`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Resposta vazia do OpenRouter");
    }

    return cleanModelText(text);
  } catch (err) {
    clearTimeout(tid);

    if (err.name === "AbortError" && signal?.aborted) {
      throw err;
    }

    for (const fallbackModel of FALLBACKS) {
      if (fallbackModel === model) continue;

      try {
        const fallbackPayload = {
          model: fallbackModel,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        };

        const res2 = await fetch(BASE, {
          ...opts,
          body: JSON.stringify(fallbackPayload),
          signal: undefined,
        });

        const d2 = await res2.json();
        const fallbackText = d2.choices?.[0]?.message?.content;

        if (fallbackText) {
          return cleanModelText(fallbackText);
        }
      } catch {
        continue;
      }
    }

    throw err;
  }
}

function cleanModelText(text) {
  return text.replace(THINK_BLOCK_REGEX, "").trim();
}

function mergeSignals(s1, s2) {
  const ctrl = new AbortController();

  const abort = () => ctrl.abort();

  s1.addEventListener("abort", abort, { once: true });
  s2.addEventListener("abort", abort, { once: true });

  return ctrl.signal;
}