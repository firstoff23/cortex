export const config = { runtime: "edge" };

const PROD_ORIGIN = "https://cortex-digital.vercel.app";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido" }, 405, origin);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return json({ error: "GROQ_API_KEY não configurada" }, 500, origin);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido" }, 400, origin);
  }

  let upstream;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return json({ error: "Falha na ligação ao Groq", detail: err.message }, 502, origin);
  }

  if (!upstream.ok) {
    const errText = await upstream.text();
    return json({ error: "Groq devolveu erro", status: upstream.status, detail: errText }, 502, origin);
  }

  const data = await upstream.json();
  return json(data, 200, origin);
}

function corsHeaders(origin) {
  const allowed = (origin.endsWith(".vercel.app") || origin.includes("localhost"))
  ? origin
  : PROD_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
