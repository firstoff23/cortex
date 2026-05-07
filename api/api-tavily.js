// Edge function — proxy Tavily (esconde a API key)
// POST { query, search_depth?, max_results?, include_answer? }

export const config = { runtime: "edge" };

const ALLOWED_ORIGIN = "https://cortex-digital.vercel.app";
const TAVILY_URL = "https://api.tavily.com/search";

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido" }, 405, origin);
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey)
    return json({ error: "TAVILY_API_KEY não configurada" }, 500, origin);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido" }, 400, origin);
  }

  const {
    query,
    search_depth = "basic",
    max_results = 4,
    include_answer = true,
  } = body;
  if (!query?.trim())
    return json({ error: "Campo obrigatório: query" }, 400, origin);

  let upstream;
  try {
    upstream = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query.trim().slice(0, 400),
        search_depth,
        max_results,
        include_answer,
      }),
    });
  } catch (e) {
    return json(
      { error: "Falha na ligação ao Tavily: " + e.message },
      502,
      origin,
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    return json(
      { error: "Tavily " + upstream.status + ": " + detail.slice(0, 120) },
      502,
      origin,
    );
  }

  const data = await upstream.json();
  return json(data, 200, origin);
}

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
