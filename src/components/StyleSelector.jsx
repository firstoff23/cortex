import React from "react";

export const ESTILOS_CONSELHO = [
  {
    id: "normal",
    nome: "Normal",
    descricao: "Respostas diretas e equilibradas.",
    efeito: "O Rei pesa clareza, contexto e decisão final sem favorecer extremos.",
  },
  {
    id: "conciso",
    nome: "Conciso",
    descricao: "Curto e objetivo.",
    efeito: "O Rei corta rodeios e privilegia sínteses accionáveis.",
  },
  {
    id: "explicativo",
    nome: "Explicativo",
    descricao: "Detalhado com contexto.",
    efeito: "O Rei expõe raciocínio, premissas e consequências antes da resposta.",
  },
  {
    id: "tecnico",
    nome: "Técnico",
    descricao: "Foco em código e sistemas.",
    efeito: "O Rei valoriza arquitectura, constraints, bugs, APIs e implementação.",
  },
  {
    id: "critico",
    nome: "Crítico",
    descricao: "Questiona e desafia.",
    efeito: "O Rei força evidência, riscos, trade-offs e pontos fracos.",
  },
  {
    id: "forense",
    nome: "Forense",
    descricao: "Auditável, com logs e scores.",
    efeito: "O Rei privilegia rastreabilidade, métricas, hipóteses e verificação.",
  },
  {
    id: "coroa",
    nome: "Coroa",
    descricao: "Modo máximo, análise profunda.",
    efeito: "O Rei combina profundidade, síntese e decisão com maior rigor.",
  },
];

export default function StyleSelector({
  estilos = ESTILOS_CONSELHO,
  estiloAtivo = "normal",
  onChange,
}) {
  return (
    <div className="style-selector" role="list" aria-label="Estilos do conselho">
      {estilos.map((estilo) => {
        const ativo = estilo.id === estiloAtivo;
        return (
          <button
            key={estilo.id}
            type="button"
            className={`style-selector__item${ativo ? " style-selector__item--active" : ""}`}
            data-style-id={estilo.id}
            aria-pressed={ativo}
            onClick={() => onChange?.(estilo.id)}
          >
            <span className="style-selector__header">
              <span className="style-selector__name">{estilo.nome}</span>
              {ativo && <span className="style-selector__active-label">Activo</span>}
            </span>
            <span className="style-selector__description">{estilo.descricao}</span>
            <span className="style-selector__effect">{estilo.efeito}</span>
          </button>
        );
      })}
    </div>
  );
}
