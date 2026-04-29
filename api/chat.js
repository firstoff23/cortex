// api/chat.js — Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { model, messages, max_tokens = 420 } = req.body || {};

    if (!model || !messages) {
      return res.status(400).json({ error: "model e messages obrigatórios" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "OPENROUTER_API_KEY não configurada" });
    }

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cortex-digital.vercel.app",
        "X-Title": "Cortex Digital"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens
      })
    });

    const raw = await r.text();

    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      return res.status(502).json({
        error: "Resposta inválida do OpenRouter",
        raw: raw?.slice(0, 500) || ""
      });
    }

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Erro OpenRouter",
        details: data || null
      });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      error: e.message || "Erro interno em /api/chat"
    });
  }
}