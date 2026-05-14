import { beforeEach, describe, expect, it } from "vitest";
import {
  buildMemoryEntry,
  clearMemory,
  getLastSessionContext,
  loadMemoryEntries,
  saveMemoryEntry,
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
});
