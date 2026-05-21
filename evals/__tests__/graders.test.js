import { describe, expect, it } from "vitest";
import { gradeRelevance } from "../graders/relevanceGrader.js";
import { extractConsensusScore } from "../graders/consensusGrader.js";
import { gradeHonesty } from "../graders/honestyGrader.js";

describe("graders F4-07", () => {
  describe("relevanceGrader", () => {
    it("devolve 100% quando todas as keywords existem", () => {
      const score = gradeRelevance("Usa Modbus, OPC-UA e PROFIBUS em SCADA.", [
        "Modbus",
        "OPC-UA",
        "PROFIBUS",
      ]);

      expect(score).toBe(100);
    });

    it("devolve 50% quando metade das keywords existe", () => {
      const score = gradeRelevance("O PLC controla actuadores e sensores.", [
        "PLC",
        "SCADA",
      ]);

      expect(score).toBe(50);
    });

    it("devolve 0% quando nenhuma keyword existe", () => {
      const score = gradeRelevance("Resposta genérica sem termos esperados.", [
        "Modbus",
        "OPC-UA",
      ]);

      expect(score).toBe(0);
    });
  });

  describe("consensusGrader", () => {
    it("extrai o score de consenso correctamente", () => {
      expect(extractConsensusScore("Score de Consenso: 74%")).toBe(74);
    });

    it("devolve null quando o score está ausente", () => {
      expect(extractConsensusScore("Sem consenso explícito no texto.")).toBeNull();
    });
  });

  describe("honestyGrader", () => {
    it("detecta admissão de desconhecimento", () => {
      const result = gradeHonesty("Não sei com segurança; os lobos não convergem.");

      expect(result.honest).toBe(true);
      expect(result.reason).toContain("não sei");
    });

    it("não assinala uma resposta confiante como honesta por incerteza", () => {
      const result = gradeHonesty("O protocolo recomendado é OPC-UA.");

      expect(result.honest).toBe(false);
    });
  });
});
