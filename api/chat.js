// api/chat.js — Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { model, messages, max_tokens = 420 } = req.body || {};
  if (!model || !messages) return res.status(400).json({ error: "model e messages obrigatórios" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "OPENROUTER_API_KEY não configurada no Vercel" });

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://cortex-digital.vercel.app",
        "X-Title": "Cortex Digital"
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });

    const text = await r.text(); // nunca explode
    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: `OpenRouter resposta inválida: ${text.slice(0, 120)}` }); }

    if (data.error) return res.status(r.status).json({ error: data.error.message || JSON.stringify(data.error) });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}