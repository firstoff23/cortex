import React from "react";

// ResultConfidence.jsx — Mostra um indicador visual premium da confiança da resposta.
export default function ResultConfidence({ confidence = 0, explanation = "", T }) {
  const pct = Math.max(0, Math.min(100, Math.round(confidence * 100)));

  // Obter cores com base no nível
  let cor = "#ef4444"; // Vermelho < 65%
  let statusText = "Crítico";
  let statusBadgeBg = "rgba(239, 68, 68, 0.1)";

  if (pct >= 85) {
    cor = "#22c55e"; // Verde >= 85%
    statusText = "Excelente";
    statusBadgeBg = "rgba(34, 197, 94, 0.1)";
  } else if (pct >= 65) {
    cor = "#eab308"; // Amarelo >= 65%
    statusText = "Razoável";
    statusBadgeBg = "rgba(234, 179, 8, 0.1)";
  }

  return (
    <div
      style={{
        background: T?.s2 || "rgba(255, 255, 255, 0.02)",
        border: `1px solid ${T?.b1 || "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .cortex-conf-bar {
          transition: width 420ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .cortex-conf-bar {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* Cabeçalho com indicador de percentagem */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T?.ts || "#a8a8b8", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Confiança do Córtex
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: cor,
              background: statusBadgeBg,
              borderRadius: 6,
              padding: "2px 6px",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {statusText}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: cor }}>
          {pct}%
        </span>
      </div>

      {/* Track da Barra */}
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: T?.s1 || "rgba(0, 0, 0, 0.2)",
          border: `1px solid ${T?.b2 || "rgba(255, 255, 255, 0.04)"}`,
          overflow: "hidden",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Fill Animado */}
        <div
          className="cortex-conf-bar"
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${cor}dd, ${cor})`,
            borderRadius: 999,
            boxShadow: `0 0 8px ${cor}44`,
          }}
        />
      </div>

      {/* Explicação da Pontuação */}
      {explanation && (
        <p
          style={{
            margin: "2px 0 0 0",
            fontSize: 11,
            lineHeight: 1.45,
            color: T?.ts || "#a8a8b8",
          }}
        >
          {explanation}
        </p>
      )}
    </div>
  );
}
