import React from "react";

// ConsensusMeter.jsx — Medidor visual de consenso entre os lobos do conselho.
export default function ConsensusMeter({ wolves = [], percent, T }) {
  
  // Função para normalizar e extrair a posição do lobo (concorda, discorda, neutro)
  const extractWolfPosition = (val) => {
    if (!val) return "neutro";
    const clean = String(val).toLowerCase().trim();
    if (/concorda|agrees|positivo|aceita|sim|yes|apoiado|agree|concordo/i.test(clean)) {
      return "positivo";
    }
    if (/discorda|disagrees|negativo|rejeita|não|nao|no|contra|disagree/i.test(clean)) {
      return "negativo";
    }
    return "neutro";
  };

  // Calcular percentagem se não for fornecida explicitamente
  const calculatedPercent = React.useMemo(() => {
    if (wolves.length === 0) return 0;
    const positiveCount = wolves.filter(w => {
      const pos = extractWolfPosition(w.posicao || w.resposta || w.result || w.stance);
      return pos === "positivo";
    }).length;
    return positiveCount / wolves.length;
  }, [wolves]);

  const finalPercent = percent !== undefined ? percent : calculatedPercent;
  const pct = Math.max(0, Math.min(100, Math.round(finalPercent * 100)));

  // Determinar cor com base no patamar
  let colorVar = "var(--danger, #ef4444)";
  let statusLabel = "Divergência Crítica";
  if (pct >= 72) {
    colorVar = "var(--success, #22c55e)";
    statusLabel = "Forte Consenso";
  } else if (pct >= 45) {
    colorVar = "var(--warning, #f59e0b)";
    statusLabel = "Consenso Moderado";
  }

  const stanceEmojis = {
    positivo: "✅ Concorda",
    negativo: "❌ Discorda",
    neutro: "⚪ Neutro"
  };

  const stanceColors = {
    positivo: "var(--success, #22c55e)",
    negativo: "var(--danger, #ef4444)",
    neutro: "var(--text-muted, #8a8aa0)"
  };

  return (
    <div
      style={{
        background: T?.s2 || "rgba(255, 255, 255, 0.02)",
        border: `1px solid ${T?.b1 || "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 12,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <style>{`
        .consensus-bar-fill {
          transition: width 420ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .consensus-bar-fill {
            transition: none !important;
          }
        }
      `}</style>

      {/* Título e percentagem */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T?.ts || "#8a8aa0", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Consenso do Conselho
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: colorVar,
              background: `${colorVar}12`,
              border: `1px solid ${colorVar}33`,
              borderRadius: 6,
              padding: "2px 6px",
              textTransform: "uppercase",
            }}
          >
            {statusLabel}
          </span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 900, color: colorVar }}>
          {pct}%
        </span>
      </div>

      {/* Barra de Consenso (role="meter") */}
      <div
        role="meter"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={pct}
        style={{
          height: 8,
          borderRadius: 999,
          background: T?.s1 || "rgba(0, 0, 0, 0.2)",
          border: `1px solid ${T?.b2 || "rgba(255, 255, 255, 0.04)"}`,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          className="consensus-bar-fill"
          style={{
            width: `${pct}%`,
            height: "100%",
            background: colorVar,
            borderRadius: 999,
            boxShadow: `0 0 6px ${colorVar}44`,
          }}
        />
      </div>

      {/* Breakdown individual dos 5 lobos */}
      {wolves.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 4,
            paddingTop: 8,
            borderTop: `1px solid ${T?.b1 || "rgba(255, 255, 255, 0.06)"}`,
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, color: T?.ts || "#8a8aa0", textTransform: "uppercase", marginBottom: 2 }}>
            Posicionamento dos Lobos
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
            {wolves.map((wolf, idx) => {
              const position = extractWolfPosition(wolf.posicao || wolf.resposta || wolf.result || wolf.stance);
              const color = stanceColors[position];
              return (
                <div
                  key={`wolf-breakdown-${idx}-${wolf.id || wolf.nome}`}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${T?.b2 || "rgba(255, 255, 255, 0.04)"}`,
                    borderRadius: 8,
                    padding: "6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: T?.tx || "#f5f5ff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {wolf.nome || wolf.label || `Lobo ${idx + 1}`}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: color, display: "flex", alignItems: "center", gap: 4 }}>
                    {stanceEmojis[position]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
