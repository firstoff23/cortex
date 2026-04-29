// src/lib/openrouter.js
// Mapeamento dos ids do Córtex para modelos OpenRouter
// Modelos :free não requerem créditos (abril 2026)
export const OR_MODELS = {
  grok:           "qwen/qwen3-235b-a22b:free",
  gemini:         "google/gemma-3-27b-it:free",
  perp:           "perplexity/r1-1776:free",
  genspark:       "meta-llama/llama-3.3-70b-instruct:free",
  manus:          "mistralai/mistral-small-3.1-24b-instruct:free",
  openai:         "openai/gpt-oss-20b:free",
  deepseek:       "deepseek/deepseek-r1:free",
  llama:          "meta-llama/llama-4-scout:free",
  mistral:        "mistralai/mistral-small-3.1-24b-instruct:free",
  nemotron:       "nvidia/llama-3.1-nemotron-70b-instruct:free",
  claude:         "qwen/qwen3-235b-a22b:free",
  ollama_codigo:  null,   // local, tratado antes de chegar aqui
  ollama_debug:   null,
};

/**
 * Chama o endpoint serverless /api/chat com fallback automático.
 * @param {string} lobeId   — id do lobe (ex: "grok")
 * @param {string} sys      — system prompt
 * @param {string} msg      — mensagem do utilizador
 * @param {number} maxTok   — max_tokens (default 420)
 * @returns {Promise<string>} — texto da resposta
 */
export async function callOpenRouter(lobeId, sys, msg, maxTok = 420) {
  const model = OR_MODELS[lobeId];
  if (!model) throw new Error(`Modelo OpenRouter não mapeado para "${lobeId}"`);

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 30000);

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({ model, messages: [
        { role: "system", content: sys },
        { role: "user",   content: msg }
      ], max_tokens: maxTok })
    });
    clearTimeout(tid);

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error(`/api/chat não devolveu JSON (${r.status}). Usa 'vercel dev' localmente.`); }

    if (data.error) {
      const msg = typeof data.error === "string"
        ? data.error
        : data.error.message || JSON.stringify(data.error);
      throw new Error(msg);
    }
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    clearTimeout(tid);
    if (e.name === "AbortError") throw new Error(`OpenRouter timeout (30s)`);
    throw e;
  }
}
