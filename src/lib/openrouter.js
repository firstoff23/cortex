// src/lib/openrouter.js
// Mapeamento dos ids do Córtex para modelos OpenRouter
export const OR_MODELS = {
  grok:           "x-ai/grok-3",
  gemini:         "google/gemini-2.5-flash",
  perp:           "perplexity/sonar-pro",
  genspark:       "meta-llama/llama-3.3-70b-instruct",   // fallback — Genspark não está no OR
  manus:          "anthropic/claude-3-5-sonnet",          // fallback para agente
  openai:         "openai/gpt-4o",
  deepseek:       "deepseek/deepseek-chat",
  llama:          "meta-llama/llama-4-scout",
  mistral:        "mistralai/mistral-large",
  nemotron:       "nvidia/nemotron-4-340b-instruct",
  claude:         "anthropic/claude-opus-4-6",
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
    if (data.error) throw new Error(data.error);
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    clearTimeout(tid);
    if (e.name === "AbortError") throw new Error(`OpenRouter timeout (30s)`);
    throw e;
  }
}