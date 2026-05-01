// /api/chat.js
export default async function handler(req) {

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://cortex-digital.vercel.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 });
  }

  const { model, messages, system } = body;

  if (!model) {
    return new Response(JSON.stringify({ error: 'Campo model em falta' }), { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Campo messages em falta ou vazio' }), { status: 400 });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY não configurada' }), { status: 503 });
  }

  const payload = {
    model,
    messages: system
      ? [{ role: 'system', content: system }, ...messages]
      : messages
  };

  let data;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.OPENROUTER_APP_URL ?? '',
        'X-Title': process.env.OPENROUTER_APP_NAME ?? 'cortex-digital',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message ?? 'Erro OpenRouter' }), {
        status: res.status
      });
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message ?? 'Erro de rede' }), { status: 502 });
  }

  return new Response(JSON.stringify({
    content:  data.choices?.[0]?.message?.content ?? '',
    model:    data.model,
    provider: 'openrouter',
    usage:    data.usage ?? null
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://cortex-digital.vercel.app'
    }
  });
}