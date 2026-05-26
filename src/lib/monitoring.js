// Sentry — falha silenciosamente se VITE_SENTRY_DSN não estiver configurado

function lerEnv(nome) {
  const viteEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  const processEnv = typeof process !== "undefined" && process.env ? process.env : {};
  return processEnv[nome] || viteEnv[nome] || "";
}

const SENTRY_DSN = lerEnv("VITE_SENTRY_DSN");
const ENV = lerEnv("MODE") || lerEnv("NODE_ENV") || "development";

let _sentry = null;
let _langfuse = undefined;

async function sentry() {
  if (_sentry) return _sentry;
  if (!SENTRY_DSN) return null;
  const Sentry = await import("@sentry/react");
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    tracesSampleRate: ENV === "production" ? 0.1 : 0,
    replaysOnErrorSampleRate: 0, // sem session replay
    integrations: [],
    beforeSend(event) {
      // Remove dados sensíveis antes de enviar
      if (event.request?.headers) delete event.request.headers["x-api-key"];
      return event;
    },
  });
  _sentry = Sentry;
  return _sentry;
}

export async function initMonitoring(userId = "anon") {
  const s = await sentry();
  if (!s) return;
  s.setUser({ id: userId });
}

export async function captureError(err, context = {}) {
  const s = await sentry();
  if (!s) {
    console.error("[Córtex]", err);
    return;
  }
  s.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    s.captureException(err);
  });
}

export async function captureMessage(msg, level = "info") {
  const s = await sentry();
  if (!s) return;
  s.captureMessage(msg, level);
}

async function langfuse() {
  if (_langfuse !== undefined) return _langfuse;

  const publicKey = lerEnv("LANGFUSE_PUBLIC_KEY");
  const secretKey = lerEnv("LANGFUSE_SECRET_KEY");
  const baseUrl = lerEnv("LANGFUSE_BASE_URL");

  if (!publicKey || !secretKey) {
    _langfuse = null;
    return null;
  }

  try {
    const moduloLangfuse = "langfuse";
    const { Langfuse } = await import(/* @vite-ignore */ moduloLangfuse);
    _langfuse = new Langfuse({
      publicKey,
      secretKey,
      ...(baseUrl ? { baseUrl } : {}),
    });
    return _langfuse;
  } catch {
    _langfuse = null;
    return null;
  }
}

function usageDetails(total) {
  const valor = Number(total);
  return Number.isFinite(valor) ? { total: valor } : undefined;
}

// Trace leve por lobo. Sem Langfuse configurado, devolve null e não interrompe o fluxo.
export async function traceLobe(evento = {}, clientOverride) {
  try {
    const client = clientOverride || await langfuse();
    if (!client) return null;

    const {
      lobo = "desconhecido",
      modelo = "desconhecido",
      pergunta = "",
      resposta = "",
      sucesso = true,
      erro = null,
      tempoMs = null,
      tokens = null,
      fase = "council",
      metadata = {},
    } = evento;

    const trace = client.trace({
      name: "cortex.lobe",
      input: pergunta,
      output: resposta,
      metadata: {
        lobo,
        modelo,
        sucesso,
        erro: erro ? String(erro) : null,
        tempo_ms: tempoMs,
        fase,
        ...metadata,
      },
    });

    const generation = trace?.generation?.({
      name: lobo,
      model: modelo,
      input: pergunta,
      metadata: {
        sucesso,
        erro: erro ? String(erro) : null,
        tempo_ms: tempoMs,
        fase,
      },
      usageDetails: usageDetails(tokens),
    });

    generation?.end?.({ output: resposta });
    const flush = client.flushAsync?.();
    await flush?.catch?.(() => {});
    return trace || null;
  } catch {
    return null;
  }
}

// Envolve uma função async e captura erros automaticamente
export function withSentry(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      await captureError(err, context);
      throw err;
    }
  };
}
