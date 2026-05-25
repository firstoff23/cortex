import { useState, useCallback } from "react";
import { LOBOS } from "../api/council.js";

// useAdaptiveRouting.js — Roteamento adaptativo de prompts para os lobos específicos baseado em palavras-chave.
export default function useAdaptiveRouting() {
  const [activeLobes, setActiveLobes] = useState(LOBOS);
  const [isRouting, setIsRouting] = useState(false);

  const routePromptRequest = useCallback(async (prompt) => {
    if (!prompt) return LOBOS;
    setIsRouting(true);

    try {
      // Dicionário de palavras-chave PT/EN e mapeamento para ID do Lobo
      // 1: Analista Crítico, 2: Inovador Criativo, 3: Pragmático Técnico, 4: Generalista Contextual, 5: Advogado do Diabo
      const checkTechnical = () => {
        const regex = /código|codigo|escreve|write|programar|programação|programacao|bug|script|desenvolve|develop|função|funcao|function|code|compile|compilar|eslint|vite|react|html|css|api/i;
        return regex.test(prompt) ? 3 : null;
      };

      const checkCritical = () => {
        const regex = /analisa|analyze|crítica|critica|critical|prova|proof|valida|validate|exame|exam|testa|verificar|verifica|segurança|seguranca|security|auditoria|audit/i;
        return regex.test(prompt) ? 1 : null;
      };

      const checkCreative = () => {
        const regex = /cria|create|ideia|idea|inovação|inovacao|innovate|alternativo|alternative|design|estética|aesthetics|criativo|creative|brainstorm/i;
        return regex.test(prompt) ? 2 : null;
      };

      const checkGeneralist = () => {
        const regex = /resume|summarize|síntese|sintese|synthesis|simplifica|simplify|geral|general|explica|explain|resumir|contexto|context/i;
        return regex.test(prompt) ? 4 : null;
      };

      const checkDebate = () => {
        const regex = /debate|discutir|discute|discuss|argumenta|argumentar|oposição|oposicao|oppose|opinião|opiniao|devil|diabo/i;
        return regex.test(prompt) ? 5 : null;
      };

      // REGRA: Promise.allSettled obrigatório
      const tasks = [
        Promise.resolve(checkTechnical()),
        Promise.resolve(checkCritical()),
        Promise.resolve(checkCreative()),
        Promise.resolve(checkGeneralist()),
        Promise.resolve(checkDebate())
      ];

      const results = await Promise.allSettled(tasks);
      
      // Extrair os IDs correspondentes resolvidos com sucesso
      const matchedIds = results
        .filter(r => r.status === "fulfilled" && r.value !== null)
        .map(r => r.value);

      let selectedLobes = [];

      if (matchedIds.length > 0) {
        selectedLobes = LOBOS.filter(l => matchedIds.includes(l.id));
      } else {
        // Fallback seguro: retorna Lobe 2 (Inovador Criativo) ou similar
        // Regra do prompt: "Fallback seguro: retorna ['criativo'] ou similar"
        const creativeLobe = LOBOS.find(l => l.id === 2);
        selectedLobes = creativeLobe ? [creativeLobe] : [LOBOS[1]]; // Lobe 2
      }

      // Adicionar a flag de segurança de injeção de sistema nos resultados internos se aplicável
      const response = selectedLobes.map(l => ({
        ...l,
        _injected: true // Proteção do middleware de segurança
      }));

      setActiveLobes(response);
      return response;
    } catch (e) {
      console.warn("[AdaptiveRouting] Erro ao analisar rota, aplicando fallback:", e);
      // Fallback seguro em caso de erro crítico
      const fallback = [LOBOS.find(l => l.id === 2) || LOBOS[1]].map(l => ({
        ...l,
        _injected: true
      }));
      setActiveLobes(fallback);
      return fallback;
    } finally {
      setIsRouting(false);
    }
  }, []);

  return {
    activeLobes,
    isRouting,
    routePromptRequest
  };
}
