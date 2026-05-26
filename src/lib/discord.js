function lerEnv(nome) {
  const viteEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  const processEnv = typeof process !== "undefined" && process.env ? process.env : {};
  return processEnv[nome] || viteEnv[nome] || "";
}

function limitar(texto, limite = 1800) {
  const valor = String(texto || "");
  return valor.length > limite ? `${valor.slice(0, limite - 3)}...` : valor;
}

function normalizarPayload(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) return payload;
  return { content: limitar(payload) };
}

export async function notifyDiscord(payload, options = {}) {
  const webhookUrl = options.webhookUrl ?? lerEnv("DISCORD_WEBHOOK_URL");
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (!webhookUrl || typeof fetchImpl !== "function") {
    return { ok: false, skipped: true };
  }

  try {
    const resposta = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizarPayload(payload)),
    });
    return { ok: Boolean(resposta?.ok), status: resposta?.status };
  } catch {
    return { ok: false };
  }
}

export async function notifyLobeTimeout(info = {}, options = {}) {
  const lobo = info.lobo || "lobo desconhecido";
  const tempo = Number.isFinite(Number(info.tempoMs)) ? `${Number(info.tempoMs)}ms` : "tempo desconhecido";
  const fase = info.fase ? ` na fase ${info.fase}` : "";
  return notifyDiscord(`[Córtex] timeout no ${lobo}${fase} após ${tempo}.`, options);
}

export async function notifyCouncilError(error, contexto = {}, options = {}) {
  const mensagem = error?.message || String(error || "erro desconhecido");
  const fase = contexto.fase ? ` na fase ${contexto.fase}` : "";
  const detalhe = contexto && Object.keys(contexto).length
    ? ` Contexto: ${limitar(JSON.stringify(contexto), 600)}`
    : "";
  return notifyDiscord(`[Córtex] Council falhou${fase}: ${limitar(mensagem, 500)}.${detalhe}`, options);
}
