import { afterEach, describe, expect, it, vi } from "vitest";
import { traceLobe } from "./monitoring.js";

describe("Langfuse monitoring", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falha silenciosamente quando Langfuse não está configurado", async () => {
    const anteriorPublic = process.env.LANGFUSE_PUBLIC_KEY;
    const anteriorSecret = process.env.LANGFUSE_SECRET_KEY;
    delete process.env.LANGFUSE_PUBLIC_KEY;
    delete process.env.LANGFUSE_SECRET_KEY;

    await expect(traceLobe({ lobo: "Analista Crítico" })).resolves.toBeNull();

    if (anteriorPublic === undefined) delete process.env.LANGFUSE_PUBLIC_KEY;
    else process.env.LANGFUSE_PUBLIC_KEY = anteriorPublic;
    if (anteriorSecret === undefined) delete process.env.LANGFUSE_SECRET_KEY;
    else process.env.LANGFUSE_SECRET_KEY = anteriorSecret;
  });

  it("regista uma geração com metadados do lobo quando recebe cliente", async () => {
    const generation = { end: vi.fn() };
    const trace = { generation: vi.fn(() => generation) };
    const client = {
      trace: vi.fn(() => trace),
      flushAsync: vi.fn(async () => {}),
    };

    await traceLobe(
      {
        lobo: "Generalista Contextual",
        modelo: "openai/gpt-oss-120b:free",
        pergunta: "Qual é o estado actual?",
        resposta: "Resposta",
        sucesso: true,
        tempoMs: 123,
        tokens: 45,
      },
      client
    );

    expect(client.trace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "cortex.lobe",
        input: "Qual é o estado actual?",
        metadata: expect.objectContaining({ lobo: "Generalista Contextual" }),
      })
    );
    expect(trace.generation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Generalista Contextual",
        model: "openai/gpt-oss-120b:free",
        usageDetails: { total: 45 },
      })
    );
    expect(generation.end).toHaveBeenCalledWith(
      expect.objectContaining({ output: "Resposta" })
    );
    expect(client.flushAsync).toHaveBeenCalled();
  });
});
