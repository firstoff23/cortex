const PROD_ORIGIN = 'https://cortex-digital.vercel.app';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const FREE_FALLBACKS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-3-4b-it:free",
  "qwen/qwen-2-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
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

  const { model, messages, system, max_tokens } = body;

  if (!model || !messages || !Array.isArray(messages)) {
    return json({ error: 'Campos obrigatórios: model, messages' }, 400, origin);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'OPENROUTER_API_KEY não configurada' }, 500, origin);
  }

  const payload = {
    max_tokens: max_tokens ?? 420,
    messages: system
      ? [{ role: 'system', content: system }, ...messages]
      : messages
  };

  const isFree = model.endsWith(':free');
  const toTry = isFree
    ? [model, ...FREE_FALLBACKS.filter(m => m !== model)]
    : [model];

  let data, lastStatus;
  for (const m of toTry) {
    let upstream;
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': PROD_ORIGIN,
          'X-Title': 'Córtex Digital'
        },
        body: JSON.stringify({ ...payload, model: m })
      });
    } catch (err) {
      return json({ error: 'Falha na ligação ao OpenRouter', detail: err.message }, 502, origin);
    }
    data = await upstream.json();
    lastStatus = upstream.status;
    if (upstream.ok && !data.error) break;
    if (lastStatus !== 404) break;
  }

  const choice = data?.choices?.[0];

  if (!choice) {
    return json({ error: 'OpenRouter devolveu erro', status: lastStatus, detail: JSON.stringify(data) }, 502, origin);
  }

  return json({
    content: choice.message?.content ?? '',
    model: data.model ?? model,
    provider: 'openrouter',
    usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  }, 200, origin);
}

function corsHeaders(origin) {
  const allowed = (origin.endsWith('.vercel.app') || origin.includes('localhost'))
    ? origin
    : PROD_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}