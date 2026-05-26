import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";

let clienteArcjet = undefined;

function lerEnv(nome) {
  return typeof process !== "undefined" && process.env ? process.env[nome] || "" : "";
}

export function criarClienteArcjet() {
  if (clienteArcjet !== undefined) return clienteArcjet;

  const key = lerEnv("ARCJET_KEY");
  if (!key) {
    clienteArcjet = null;
    return null;
  }

  try {
    clienteArcjet = arcjet({
      key,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
        }),
        tokenBucket({
          mode: "LIVE",
          refillRate: 20,
          interval: 60,
          capacity: 20,
        }),
      ],
    });
    return clienteArcjet;
  } catch {
    clienteArcjet = null;
    return null;
  }
}

function resolverCliente(config) {
  if (Object.prototype.hasOwnProperty.call(config, "cliente")) return config.cliente;
  return criarClienteArcjet();
}

export function criarArcjetMiddleware(config = {}) {
  return async function arcjetMiddleware(req, res, next) {
    const cliente = resolverCliente(config);
    if (!cliente) return next();

    try {
      const decisao = await cliente.protect(req, { requested: 1 });
      if (decisao?.isErrored?.()) return next();

      if (decisao?.isDenied?.()) {
        const isRateLimit = decisao.reason?.isRateLimit?.();
        return res
          .status(isRateLimit ? 429 : 403)
          .json({
            error: isRateLimit
              ? "Demasiados pedidos. Aguarda 1 minuto."
              : "Pedido bloqueado pela protecção de segurança.",
          });
      }

      return next();
    } catch {
      // Arcjet nunca deve bloquear a app se o serviço ou a rede falharem.
      return next();
    }
  };
}

export default criarArcjetMiddleware();
