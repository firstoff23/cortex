import { describe, expect, it, vi } from "vitest";
import { criarArcjetMiddleware } from "./arcjet.js";

function criarRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

describe("arcjet middleware", () => {
  it("continua silenciosamente quando Arcjet não está configurado", async () => {
    const next = vi.fn();
    const middleware = criarArcjetMiddleware({ cliente: null });

    await middleware({ headers: {} }, criarRes(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("bloqueia decisões negadas com 429 quando a razão é rate limit", async () => {
    const next = vi.fn();
    const res = criarRes();
    const cliente = {
      protect: vi.fn(async () => ({
        isDenied: () => true,
        reason: { isRateLimit: () => true },
      })),
    };
    const middleware = criarArcjetMiddleware({ cliente });

    await middleware({ headers: {} }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(429);
    expect(res.payload).toEqual({ error: "Demasiados pedidos. Aguarda 1 minuto." });
  });

  it("falha aberto quando Arcjet devolve erro ou lança excepção", async () => {
    const nextErrored = vi.fn();
    const middlewareErrored = criarArcjetMiddleware({
      cliente: { protect: vi.fn(async () => ({ isDenied: () => false, isErrored: () => true })) },
    });

    await middlewareErrored({ headers: {} }, criarRes(), nextErrored);
    expect(nextErrored).toHaveBeenCalledOnce();

    const nextThrow = vi.fn();
    const middlewareThrow = criarArcjetMiddleware({
      cliente: { protect: vi.fn(async () => { throw new Error("arcjet indisponível"); }) },
    });

    await middlewareThrow({ headers: {} }, criarRes(), nextThrow);
    expect(nextThrow).toHaveBeenCalledOnce();
  });
});
