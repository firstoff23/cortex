import { beforeEach, describe, expect, it } from "vitest";
import {
  buildMemoryEntry,
  clearMemory,
  getLastSessionContext,
  injectSessionContext,
  loadMemoryEntries,
  saveMemoryEntry,
  shouldShowMemoryBanner,
} from "./sessionMemory.js";

function criarLocalStorageFake() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe("sessionMemory", () => {
  beforeEach(() => {
    globalThis.localStorage = criarLocalStorageFake();
  });

  it("gera resumo simples com primeira e última mensagem do utilizador", () => {
    const entry = buildMemoryEntry(
      [
        { role: "user", content: "Primeira pergunta sobre RAG" },
        { role: "assistant", content: "Resposta inicial sobre RAG" },
        { role: "user", content: "Última dúvida sobre CAG" },
      ],
      "conv-1"
    );

    expect(entry.id).toBe("conv-1");
    expect(entry.primeiraMensagem).toBe("Primeira pergunta sobre RAG");
    expect(entry.ultimaMensagem).toBe("Última dúvida sobre CAG");
    expect(entry.ultimaResposta).toBe("Resposta inicial sobre RAG");
    expect(entry.totalMensagens).toBe(3);
  });

  it("guarda no máximo cinco memórias e usa a mais recente como contexto", () => {
    Array.from({ length: 6 }, (_, idx) => idx + 1).forEach((n) => {
      saveMemoryEntry({
        id: `conv-${n}`,
        data: "14/05/2026",
        hora: `10:0${n}`,
        primeiraMensagem: `pergunta ${n}`,
        ultimaMensagem: `fim ${n}`,
        ultimaResposta: `resposta ${n}`,
        totalMensagens: n,
      });
    });

    const entries = loadMemoryEntries();
    expect(entries).toHaveLength(5);
    expect(entries[0].id).toBe("conv-6");
    expect(entries[4].id).toBe("conv-2");
    expect(getLastSessionContext()).toContain("pergunta 6");
    expect(getLastSessionContext()).toContain("resposta 6");
  });

  it("limpa a memória guardada", () => {
    saveMemoryEntry({
      id: "conv-1",
      data: "14/05/2026",
      hora: "10:00",
      primeiraMensagem: "olá",
      ultimaMensagem: "fim",
      ultimaResposta: "resposta",
      totalMensagens: 2,
    });

    clearMemory();

    expect(loadMemoryEntries()).toEqual([]);
    expect(getLastSessionContext()).toBeNull();
  });

  it("retorna null quando ainda não existe contexto anterior", () => {
    expect(getLastSessionContext()).toBeNull();
  });

  it("não quebra quando localStorage está indisponível", () => {
    delete globalThis.localStorage;

    expect(() => saveMemoryEntry({ id: "conv-sem-storage" })).not.toThrow();
    expect(() => clearMemory()).not.toThrow();
    expect(loadMemoryEntries()).toEqual([]);
    expect(getLastSessionContext()).toBeNull();
  });

  it("decide mostrar banner só em chat novo com contexto disponível", () => {
    expect(shouldShowMemoryBanner({
      page: "chat",
      dismissed: false,
      context: "Contexto anterior",
      messages: [],
    })).toBe(true);

    expect(shouldShowMemoryBanner({
      page: "chat",
      dismissed: false,
      context: null,
      messages: [],
    })).toBe(false);

    expect(shouldShowMemoryBanner({
      page: "chat",
      dismissed: false,
      context: "Contexto anterior",
      messages: [{ role: "user", content: "olá" }],
    })).toBe(false);

    expect(shouldShowMemoryBanner({
      page: "settings",
      dismissed: false,
      context: "Contexto anterior",
      messages: [],
    })).toBe(false);
  });

  it("injecta contexto como primeira mensagem de sistema sem duplicar contexto", () => {
    const resultado = injectSessionContext(
      [{ role: "assistant", content: "nota antiga", memoryContext: true }],
      "Contexto da sessão anterior",
      () => "mem-1"
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({
      id: "mem-1",
      role: "system",
      content: "Contexto da sessão anterior",
      systemNote: true,
      memoryContext: true,
    });
  });

  it("não injecta contexto quando já existe mensagem do utilizador", () => {
    const mensagens = [{ role: "user", content: "já comecei" }];

    expect(injectSessionContext(mensagens, "Contexto", () => "mem-1")).toBe(mensagens);
  });
});
