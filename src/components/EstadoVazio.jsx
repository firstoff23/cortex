import React from "react";

// EstadoVazio.jsx — ecrã inicial para sessões sem mensagens.
export default function EstadoVazio({ titulo, subtitulo, sugestoes = [], onSugestao }) {
  const normalizarSugestao = (item) => {
    if (typeof item === "string") return { texto: item, modo: "casual" };
    return {
      texto: item?.texto || "",
      modo: item?.modo || "casual",
    };
  };

  return (
    <section
      aria-label="Estado vazio"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80%",
        gap: 14,
        padding: "24px 14px",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent-bg, rgba(16,185,129,0.12))",
          border: "1px solid var(--accent-border, rgba(16,185,129,0.35))",
          fontSize: 31,
          boxShadow: "0 14px 36px rgba(0,0,0,0.22)",
        }}
      >
        🐺
      </div>

      <div>
        <h2 style={{ margin: 0, color: "var(--text-h, #f5f5ff)", fontSize: 28, fontWeight: 900 }}>
          {titulo}
        </h2>
        {subtitulo && (
          <p style={{ margin: "7px auto 0", color: "var(--text, #8a8aa0)", fontSize: 13, lineHeight: 1.55, maxWidth: 440 }}>
            {subtitulo}
          </p>
        )}
      </div>

      {sugestoes.length > 0 && (
        <div style={{ display: "grid", gap: 7, width: "100%", maxWidth: 520, marginTop: 4 }}>
          <style>
            {`@keyframes fade-in-chip {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }`}
          </style>
          {sugestoes.map((item, idx) => {
            const chip = normalizarSugestao(item);
            const textoVisivel = chip.texto.length > 40 ? `${chip.texto.slice(0, 40)}...` : chip.texto;

            return (
              <button
                key={`estado-vazio-${idx}-${chip.modo}-${chip.texto.slice(0, 14)}`}
                type="button"
                title={chip.texto}
                onClick={() => onSugestao?.(chip.texto)}
                style={{
                  background: "var(--social-bg, rgba(255,255,255,0.04))",
                  border: chip.modo === "urgente"
                    ? "1px solid var(--danger, #ef4444)"
                    : "1px solid var(--border, rgba(255,255,255,0.12))",
                  borderRadius: 12,
                  padding: "10px 13px",
                  color: "var(--text, #c9c9d8)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  fontSize: 12,
                  lineHeight: 1.35,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  animation: `fade-in-chip 180ms ease ${idx * 45}ms both`,
                }}
              >
                {textoVisivel}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
