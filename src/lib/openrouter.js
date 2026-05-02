export const OR_MODELS = {
  grok:     "meta-llama/llama-3.1-8b-instruct:free",   // sem key grok-3 real
  gemini:   "google/gemma-3-12b-it:free",
  perp:     "mistralai/mistral-7b-instruct:free",
  openai:   "meta-llama/llama-3.1-8b-instruct:free",   // fallback livre
  deepseek: "deepseek/deepseek-r1:free",
  llama:    "meta-llama/llama-3.3-70b-instruct:free",
  mistral:  "mistralai/mistral-7b-instruct:free",
  nemotron: "meta-llama/llama-3.3-70b-instruct:free",  // fallback livre
  claude:   "anthropic/claude-3.5-sonnet",             // juiz — pago
  genspark: "meta-llama/llama-3.1-8b-instruct:free",   // simulado
  manus:    "meta-llama/llama-3.3-70b-instruct:free",  // simulado agente
};

export async function callOpenRouter(id, sys, msg, maxTokens = 420) {
  const model = OR_MODELS[id];
  if (!model) throw new Error(`OR_MODELS: id desconhecido "${id}"`);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: sys,
      messages: [{ role: "user", content: msg }],
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`/api/chat ${res.status}: ${err.slice(0, 120)}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.choices?.[0]?.message?.content ?? "";
}
