// Mapa lobe → modelo OpenRouter (todos gratuitos por defeito)
export const OR_MODELS = {
  grok:          "meta-llama/llama-3.1-8b-instruct:free",
  gemini:        "google/gemma-3-12b-it:free",
  perp:          "mistralai/mistral-7b-instruct:free",
  genspark:      "meta-llama/llama-3.1-8b-instruct:free",
  manus:         "meta-llama/llama-3.1-8b-instruct:free",
  openai:        "openai/gpt-4o",
  deepseek:      "deepseek/deepseek-r1:free",
  llama:         "meta-llama/llama-3.1-70b-instruct:free",
  mistral:       "mistralai/mistral-7b-instruct:free",
  nemotron:      "nvidia/llama-3.1-nemotron-70b-instruct:free",
  claude:        "anthropic/claude-3.5-sonnet",
};

export async function callOpenRouter(lobeId, system, userMsg, maxTokens = 500) {
  const model = OR_MODELS[lobeId] || "meta-llama/llama-3.1-8b-instruct:free";
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system,
      messages: [{ role: "user", content: userMsg }],
      max_tokens: maxTokens
    })
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error?.message || `HTTP ${r.status}`);
  }
  const d = await r.json();
  if (d.error) throw new Error(typeof d.error === "string" ? d.error : JSON.stringify(d.error));
  return { content: d.content, model };
}