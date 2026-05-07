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

export default async function handler(req, res) {
  const origin = req.headers["origin"] || "";

  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const body = req.body;
  const { model, messages, system, max_tokens } = body || {};

  if (!model || !messages || !Array.isArray(messages)) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: model, messages" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return res
      .status(500)
      .json({ error: "OPENROUTER_API_KEY não configurada" });

  const payload = {
    max_tokens: max_tokens ?? 420,
    messages: system
      ? [{ role: "system", content: system }, ...messages]
      : messages,
  };

  const isFree = model.endsWith(":free");
  const toTry = isFree
    ? [model, ...FREE_FALLBACKS.filter((m) => m !== model)]
    : [model];

  let data, lastStatus;
  for (const m of toTry) {
    let upstream;
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": PROD_ORIGIN,
          "X-Title": "Córtex Digital",
        },
        body: JSON.stringify({ ...payload, model: m }),
      });
    } catch (err) {
      return res
        .status(502)
        .json({ error: "Falha na ligação ao OpenRouter", detail: err.message });
    }
    data = await upstream.json();
    lastStatus = upstream.status;
    if (upstream.ok && !data.error) break;
  }

  const choice = data?.choices?.[0];
  if (!choice) {
    return res
      .status(502)
      .json({
        error: "OpenRouter devolveu erro",
        status: lastStatus,
        detail: JSON.stringify(data),
      });
  }

  return res.status(200).json({
    content: choice.message?.content ?? "",
    model: data.model ?? model,
    provider: "openrouter",
    usage: data.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  });
}
