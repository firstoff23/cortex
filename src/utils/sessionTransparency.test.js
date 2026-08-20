import { describe, expect, it } from "vitest";
import { buildSessionTransparency } from "./sessionTransparency";

describe("buildSessionTransparency", () => {
  it("deduplica participantes e fontes sem expor conteúdos das respostas", () => {
    const summary = buildSessionTransparency(
      [
        { id: "gemini", nome: "Gemini" },
        { id: "gemini", nome: "Gemini" },
        { id: "deepseek", label: "DeepSeek" },
      ],
      [
        { title: "NASA", url: "https://nasa.gov/apod" },
        { title: "NASA", url: "https://nasa.gov/apod" },
        { title: "ESA", url: "https://esa.int" },
      ],
    );

    expect(summary).toEqual({
      participants: ["Gemini", "DeepSeek"],
      participantCount: 2,
      sourceCount: 2,
      hasExternalSources: true,
    });
  });

  it("trata dados ausentes como uma sessão sem metadados externos", () => {
    expect(buildSessionTransparency()).toEqual({
      participants: [],
      participantCount: 0,
      sourceCount: 0,
      hasExternalSources: false,
    });
  });
});
