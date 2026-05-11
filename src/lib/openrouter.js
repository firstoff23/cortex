export const OR_MODELS = {
  grok: "meta-llama/llama-3.1-8b-instruct:free", // sem key grok-3 real
  gemini: "google/gemma-3-12b-it:free",
  perp: "mistralai/mistral-7b-instruct:free",
  openai: "meta-llama/llama-3.1-8b-instruct:free", // fallback livre
  deepseek: "deepseek/deepseek-r1:free",
  llama: "meta-llama/llama-3.3-70b-instruct:free",
  mistral: "mistralai/mistral-7b-instruct:free",
  nemotron: "meta-llama/llama-3.3-70b-instruct:free", // fallback livre
  claude: "anthropic/claude-3.5-sonnet", // juiz — pago
  genspark: "meta-llama/llama-3.1-8b-instruct:free", // simulado
  manus: "meta-llama/llama-3.3-70b-instruct:free", // simulado agente
};

const FREE_FALLBACKS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-3-4b-it:free",
  "qwen/qwen-2-7b-instruct:free",
];

async function fetchWithTimeout(url, opts = {}, ms = 30000, externalSignal) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  const abortFromExternal = () => ctrl.abort();
  if (externalSignal) {
    if (externalSignal.aborted) ctrl.abort();
    else externalSignal.addEventListener("abort", abortFromExternal, { once: true });
  }
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(tid);
    externalSignal?.removeEventListener?.("abort", abortFromExternal);
    return res;
  } catch (e) {
    clearTimeout(tid);
    externalSignal?.removeEventListener?.("abort", abortFromExternal);
    if (e.name === "AbortError") throw new Error(`Timeout após ${ms / 1000}s`);
    throw e;
  }
}

async function lerJsonSeguro(res) {
  const texto = await res.text().catch(() => "");
  if (!texto.trim()) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return { error: `Resposta não-JSON HTTP ${res.status}` };
  }
}

export async function callOpenRouter(id, sys, msg, maxTokens = 420, timeoutMs = 30000, options = {}) {
  let model = OR_MODELS[id];
  if (!model) throw new Error(`OR_MODELS: id desconhecido "${id}"`);

  // Se for modelo :free, tenta com fallbacks automáticos
  const isFree = model.endsWith(":free");
  const toTry = isFree
    ? [model, ...FREE_FALLBACKS.filter((m) => m !== model)]
    : [model];

  let lastErr;
  for (const m of toTry) {
    try {
      const res = await fetchWithTimeout("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m,
          system: sys,
          messages: [{ role: "user", content: msg }],
          max_tokens: maxTokens,
        }),
      }, timeoutMs, options.signal);
      const data = await lerJsonSeguro(res);
      if (res.ok && data && !data.error) return data.content ?? "";
      lastErr = data?.error || `resposta vazia HTTP ${res.status}`;
      // Se não for 404, não tenta o seguinte
      if (!String(lastErr).includes("404")) throw new Error(lastErr);
    } catch (e) {
      lastErr = e.message;
      if (!String(e.message).includes("404")) throw e;
    }
  }
  throw new Error(`Todos os modelos falharam: ${lastErr}`);
}
