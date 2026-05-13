import React from "react";

// LobeLoader.jsx — indicador pequeno por lobo, só com CSS nativo.
export default function LobeLoader({ cor = "var(--accent, #10b981)", texto = "A pensar...", tamanho = 24 }) {
  return (
    <div
      role="status"
      aria-label={texto}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        color: cor,
      }}
    >
      <style>{`
        @keyframes lobeSpin{to{transform:rotate(360deg)}}
      `}</style>
      <span
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: "50%",
          border: `2px solid ${cor}22`,
          borderTopColor: cor,
          animation: "lobeSpin 0.8s linear infinite",
        }}
      />
      {texto && <span style={{ fontSize: 10, color: "var(--text, #8a8aa0)" }}>{texto}</span>}
    </div>
  );
}
