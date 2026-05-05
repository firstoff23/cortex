// Sentry — falha silenciosamente se VITE_SENTRY_DSN não estiver configurado

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV        = import.meta.env.MODE ?? "development";

let _sentry = null;

async function sentry() {
  if (_sentry) return _sentry;
  if (!SENTRY_DSN) return null;
  const Sentry = await import("@sentry/react");
  Sentry.init({
    dsn:              SENTRY_DSN,
    environment:      ENV,
    tracesSampleRate: ENV === "production" ? 0.1 : 0,
    replaysOnErrorSampleRate: 0,   // sem session replay
    integrations:     [],
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
  if (!s) { console.error("[Córtex]", err); return; }
  s.withScope(scope => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    s.captureException(err);
  });
}

export async function captureMessage(msg, level = "info") {
  const s = await sentry();
  if (!s) return;
  s.captureMessage(msg, level);
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
