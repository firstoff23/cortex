import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyCouncilError, notifyDiscord, notifyLobeTimeout } from "./discord.js";

describe("discord notifications", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falha silenciosamente quando não existe webhook", async () => {
    await expect(notifyDiscord("Teste", { webhookUrl: "" })).resolves.toEqual({
      ok: false,
      skipped: true,
    });
  });

  it("envia payload simples para o webhook configurado", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true }));

    await expect(
      notifyDiscord("Mensagem", {
        webhookUrl: "https://discord.test/webhook",
        fetchImpl,
      })
    ).resolves.toEqual({ ok: true });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://discord.test/webhook",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ content: "Mensagem" });
  });

  it("notifica timeout de lobo e erro do council sem lançar", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true }));
    const opts = { webhookUrl: "https://discord.test/webhook", fetchImpl };

    await expect(
      notifyLobeTimeout({ lobo: "Analista Crítico", tempoMs: 60000 }, opts)
    ).resolves.toEqual({ ok: true });
    await expect(
      notifyCouncilError(new Error("falhou"), { fase: "beta" }, opts)
    ).resolves.toEqual({ ok: true });

    const conteudos = fetchImpl.mock.calls.map((call) => JSON.parse(call[1].body).content);
    expect(conteudos[0]).toContain("timeout");
    expect(conteudos[0]).toContain("Analista Crítico");
    expect(conteudos[1]).toContain("Council");
    expect(conteudos[1]).toContain("falhou");
  });
});
