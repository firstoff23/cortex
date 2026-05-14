const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function supabaseDisponivel() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

/**
 * @param {string} userId
 * @param {string} mode
 * @returns {Promise<string[]>}
 */
export async function fetchChipsForMode(userId, mode) {
  if (!supabaseDisponivel() || !userId || !mode) return [];

  const params = new URLSearchParams({
    select: "text",
    user_id: `eq.${userId}`,
    mode: `eq.${mode}`,
    order: "usage_count.desc,updated_at.desc",
    limit: "4",
  });

  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/chips?${params.toString()}`, {
    method: "GET",
    headers: headers(),
  });

  if (!resposta.ok) return [];
  const dados = await resposta.json().catch(() => []);
  return Array.isArray(dados) ? dados.map((item) => item.text).filter(Boolean) : [];
}

/**
 * @param {string} userId
 * @param {string} mode
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function recordChipUsage(userId, mode, text) {
  if (!supabaseDisponivel() || !userId || !mode || !text) return false;

  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/chips`, {
    method: "POST",
    headers: {
      ...headers(),
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      user_id: userId,
      mode,
      text,
      usage_count: 1,
    }),
  });

  return resposta.ok;
}
