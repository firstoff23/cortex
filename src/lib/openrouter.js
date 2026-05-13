// Model IDs verificados no OpenRouter — Maio 2026

const BASE = "https://openrouter.ai/api/v1/chat/completions";

// ── MODEL MAP — IDs válidos no OpenRouter ──────────────────
// Usa :free para não gastar créditos.
// Se tiveres OPENROUTER_API_KEY com créditos,
// podes remover o :free e usar modelos maiores.
export const OR_MODELS = {
  // ── Council of Wolves ──────────────────────────────────
  "analista-critico":    "deepseek/deepseek-r1:free",
  "inovador-criativo":   "google/gemma-3-27b-it:free",
  "pragmatico-tecnico":  "qwen/qwen3-14b:free",
  "generalista":         "meta-llama/llama-3.3-70b-instruct:free",
  "advogado-do-diabo":   "mistralai/mistral-small-3.1-24b-instruct:free",

  // ── Juízes ─────────────────────────────────────────────
  "juiz-factual":        "google/gemma-3-12b-it:free",
  "juiz-relevancia":     "google/gemma-3-12b-it:free",
  "juiz-coerencia":      "meta-llama/llama-3.3-70b-instruct:free",

  // ── Lobes originais (compatibilidade) ──────────────────
  grok:        "deepseek/deepseek-r1:free",
  gemini:      "google/gemma-3-27b-it:free",
  perp:        "meta-llama/llama-3.3-70b-instruct:free",
  genspark:    "qwen/qwen3-14b:free",
  manus:       "qwen/qwen3-14b:free",
  openai:      "microsoft/phi-4:free",
  deepseek:    "deepseek/deepseek-chat-v3-0324:free",
  llama:       "meta-llama/llama-3.3-70b-instruct:free",
  mistral:     "mistralai/mistral-small-3.1-24b-instruct:free",
  nemotron:    "nvidia/llama-3.3-nemotron-super-49b-v1:free",
  claude:      "google/gemma-3-27b-it:free",    // fallback se sem chave Anthropic

  // ── Fallback geral ──────────────────────────────────────
  default:     "google/gemma-3-12b-it:free",
};

// ── FALLBACK CHAIN — se modelo principal falhar ─────────────
const FALLBACKS = [
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-8b:free",
];

// ── CALL OPENROUTER ─────────────────────────────────────────
// @param {string} lobeIdOrModel  — ID do lobe OU model string directa
// @param {string} system         — system prompt
// @param {string} userMsg        — mensagem do utilizador
// @param {number} maxTokens      — limite de tokens (default 420)
// @param {AbortSignal} signal    — para cancelar (opcional)
export async function callOpenRouter(
  lobeIdOrModel,
  system,
  userMsg,
  maxTokens = 420,
  signal = null
) {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
           || import.meta.env.OPENROUTER_API_KEY
           || "";

  if (!key || key.length < 10) {
    throw new Error(
      "OPENROUTER_API_KEY não configurada. " +
      "Adiciona VITE_OPENROUTER_API_KEY no Vercel → Settings → Environment Variables."
    );
  }

  // Resolve o model ID
  const model =
    OR_MODELS[lobeIdOrModel] ||          // lobe ID conhecido
    (lobeIdOrModel.includes("/") ? lobeIdOrModel : null) || // model string directa
    OR_MODELS.default;

  const opts = {
    method: "POST",
    headers: {
      "Content-Type":    "application/json",
      "Authorization":   `Bearer ${key}`,
      "HTTP-Referer":    "https://cortex-digital.vercel.app",
      "X-Title":         "Córtex Digital",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user",   content: userMsg },
      ],
    }),
    ...(signal ? { signal } : {}),
  };

  // Timeout interno: 25 s (Vercel Pro tem 60 s; Hobby 10 s)
  const ctrl   = new AbortController();
  const tid    = setTimeout(() => ctrl.abort(), 25_000);
  const merged = signal
    ? mergeSignals(signal, ctrl.signal)
    : ctrl.signal;

  try {
    const res = await fetch(BASE, { ...opts, signal: merged });
    clearTimeout(tid);

    const data = await res.json();

    // Erros explícitos do OpenRouter
    if (data.error) {
      const msg = typeof data.error === "string"
        ? data.error
        : data.error.message || JSON.stringify(data.error);
      throw new Error(`OpenRouter devolveu erro: ${msg}`);
    }

    // HTTP 404 → model não existe
    if (res.status === 404) {
      throw new Error(`HTTP 404 — model "${model}" não encontrado no OpenRouter`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Resposta vazia do OpenRouter");

    return text.trim();

  } catch (err) {
    clearTimeout(tid);

    // Não tenta fallback se foi o utilizador a cancelar
    if (err.name === "AbortError" && signal?.aborted) throw err;

    // Tenta fallbacks antes de desistir
    for (const fb of FALLBACKS) {
      if (fb === model) continue; // já tentámos este
      try {
        const res2 = await fetch(BASE, {
          ...opts,
          body: JSON.stringify({
            model: fb,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
              { role: "user",   content: userMsg },
            ],
          }),
        });
        const d2 = await res2.json();
        if (d2.choices?.[0]?.message?.content) {
          return d2.choices[0].message.content.trim();
        }
      } catch {
        // continua para o próximo fallback
      }
    }

    throw err; // todos os fallbacks falharam
  }
}

// ── Utilitário: merge de dois AbortSignals ───────────────────
function mergeSignals(s1, s2) {
  const ctrl = new AbortController();
  const abort = () => ctrl.abort();
  s1.addEventListener("abort", abort, { once: true });
  s2.addEventListener("abort", abort, { once: true });
  return ctrl.signal;
}
