export const config = { runtime: 'edge' };

const ALLOWED_ORIGIN = 'https://cortex-digital.vercel.app';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin)
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido' }, 405, origin);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body inválido' }, 400, origin);
  }

  const { model, messages, system } = body;

  if (!model || !messages || !Array.isArray(messages)) {
    return json({ error: 'Campos obrigatórios: model, messages' }, 400, origin);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'OPENROUTER_API_KEY não configurada' }, 500, origin);
  }

  const payload = {
    model,
    messages: system
      ? [{ role: 'system', content: system }, ...messages]
      : messages
  };

  let upstream;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': ALLOWED_ORIGIN,
        'X-Title': 'Córtex Digital'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return json({ error: 'Falha na ligação ao OpenRouter', detail: err.message }, 502, origin);
  }

  if (!upstream.ok) {
    const errText = await upstream.text();
    return json({ error: 'OpenRouter devolveu erro', status: upstream.status, detail: errText }, 502, origin);
  }

  const data = await upstream.json();
  const choice = data.choices?.[0];

  if (!choice) {
    return json({ error: 'Resposta vazia do OpenRouter' }, 502, origin);
  }

  return json({
    content: choice.message?.content ?? '',
    model: data.model ?? model,
    provider: 'openrouter',
    usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  }, 200, origin);
}

// --- helpers ---

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin)
    }
  });
}
