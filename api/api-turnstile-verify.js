// Edge function — verifica token Turnstile no servidor
// POST { token }  →  { success: true|false }

export const config = { runtime: "edge" };

const ALLOWED_ORIGIN = "https://cortex-digital.vercel.app";

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ success: false }, 405, origin);
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret)
    return json(
      { success: false, error: "TURNSTILE_SECRET_KEY não configurada" },
      500,
      origin,
    );

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ success: false }, 400, origin);
  }

  const { token } = body;
  if (!token) return json({ success: false }, 400, origin);

  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "";

  const form = new URLSearchParams();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  let result;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: form,
      },
    );
    result = await res.json();
  } catch (e) {
    return json({ success: false, error: e.message }, 502, origin);
  }

  return json({ success: result.success === true }, 200, origin);
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
