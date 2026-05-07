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

export async function callOpenRouter(id, sys, msg, maxTokens = 420) {
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m,
          system: sys,
          messages: [{ role: "user", content: msg }],
          max_tokens: maxTokens,
        }),
      });
      const data = await res.json();
      if (res.ok && !data.error) return data.content ?? "";
      lastErr = data.error || `HTTP ${res.status}`;
      // Se não for 404, não tenta o seguinte
      if (!String(lastErr).includes("404")) throw new Error(lastErr);
    } catch (e) {
      lastErr = e.message;
      if (!String(e.message).includes("404")) throw e;
    }
  }
  throw new Error(`Todos os modelos falharam: ${lastErr}`);
}
