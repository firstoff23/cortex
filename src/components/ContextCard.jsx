import React from "react";

// Cartão de entrada para abrir contexto sem transformar a landing num chat vazio.
export default function ContextCard({ id, icon, titulo, descricao, detalhe, onClick }) {
  return (
    <button
      type="button"
      className="landing-context-card"
      data-context-id={id}
      onClick={() => onClick?.(id)}
    >
      <span className="landing-context-card__icon" aria-hidden="true">{icon}</span>
      <span className="landing-context-card__body">
        <span className="landing-context-card__title">{titulo}</span>
        <span className="landing-context-card__description">{descricao}</span>
      </span>
      {detalhe && <span className="landing-context-card__detail">{detalhe}</span>}
    </button>
  );
}
