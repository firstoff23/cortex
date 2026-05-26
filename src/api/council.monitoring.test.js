import { afterEach, describe, expect, it, vi } from "vitest";

const traceLobeMock = vi.fn(async () => null);

vi.mock("../lib/monitoring.js", () => ({
  traceLobe: traceLobeMock,
}));

describe("council monitoring", () => {
  const fetchOriginal = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
    traceLobeMock.mockClear();
    vi.resetModules();
  });

  it("regista trace do lobo depois de uma resposta OpenRouter", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      headers: { get: () => "hit" },
      text: async () => JSON.stringify({
        choices: [{ message: { content: '{"resposta":"ok","reasoning":"teste"}' } }],
        usage: { total_tokens: 12 },
      }),
    }));

    const { chamarLobe } = await import("./council.js");
    await chamarLobe(
      {
        id: 1,
        nome: "Analista Crítico",
        modelo: "modelo-teste",
        provider: "openrouter",
      },
      "Pergunta?"
    );

    expect(traceLobeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lobo: "Analista Crítico",
        modelo: "modelo-teste",
        pergunta: "Pergunta?",
        sucesso: true,
        tokens: 12,
      })
    );
  });
});
