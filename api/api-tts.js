// Edge function — converte texto em áudio via ElevenLabs
// POST { text, voiceId?, modelId? }  →  audio/mpeg stream

export const config = { runtime: "edge" };

const ALLOWED_ORIGIN = "https://cortex-digital.vercel.app";
const EL_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Voz padrão: "Adam" (multilingual v2 suporta PT)
const DEFAULT_VOICE = "pNInz6obpgDQGcFmaJgB";
const DEFAULT_MODEL = "eleven_multilingual_v2";

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return err("Método não permitido", 405, origin);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return err("ELEVENLABS_API_KEY não configurada", 500, origin);

  let body;
  try {
    body = await req.json();
  } catch {
    return err("Body inválido", 400, origin);
  }

  const { text, voiceId = DEFAULT_VOICE, modelId = DEFAULT_MODEL } = body;
  if (!text?.trim()) return err("Campo obrigatório: text", 400, origin);

  // Limita a 5000 chars para não gastar créditos por acidente
  const safeText = text.trim().slice(0, 5000);

  let upstream;
  try {
    upstream = await fetch(`${EL_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: safeText,
        model_id: modelId,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
  } catch (e) {
    return err("Falha na ligação ao ElevenLabs: " + e.message, 502, origin);
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    return err(
      "ElevenLabs erro " + upstream.status + ": " + detail.slice(0, 120),
      502,
      origin,
    );
  }

  // Devolve o stream de áudio directamente
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      ...corsHeaders(origin),
    },
  });
}

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function err(msg, status, origin) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
