import React from "react";

function scorePercent(score) {
  if (typeof score !== "number") return 0;
  const normalized = score > 1 ? score : score * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function scoreColor(score, T) {
  const pct = scorePercent(score);
  if (pct >= 75) return "#22c55e";
  if (pct >= 45) return "#f59e0b";
  return "#ef4444";
}

function sanitizarProblemaJuiz(item) {
  const texto = String(item || "");
  if (/Unexpected end of JSON input|Failed to execute 'json'/i.test(texto)) {
    return "JSON inválido ou resposta vazia do proxy /api/chat";
  }
  return texto;
}

const JudgeCard = React.memo(function JudgeCard({ judge, T = {}, compact = false }) {
  if (!judge) return null;

  const resultado = judge.resultado || {};
  const pct = scorePercent(resultado.score);
  const cor = scoreColor(resultado.score, T);
  const problemas = Array.isArray(resultado.problemas)
    ? resultado.problemas.map(sanitizarProblemaJuiz)
    : [];
  const validados = Array.isArray(resultado.validados) ? resultado.validados : [];

  return (
    <div
      style={{
        background: T.s2 || "var(--social-bg)",
        border: `1px solid ${judge.sucesso === false ? "#ef444455" : T.b1 || "var(--border)"}`,
        borderRadius: 8,
        padding: compact ? "9px 10px" : "11px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        boxShadow: "0 4px 14px #00000014",
      }}
    >
      {/* Cabeçalho do juiz especializado */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: compact ? 24 : 28,
              height: compact ? 24 : 28,
              borderRadius: 8,
              background: `${cor}18`,
              border: `1px solid ${cor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: compact ? 12 : 14,
            }}
          >
            {judge.emoji || "⚖️"}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: T.tx || "var(--text-h)",
                fontSize: compact ? 11 : 12,
                fontWeight: 800,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {judge.nome || judge.juiz}
            </div>
            <div style={{ color: T.tf || "var(--text)", fontSize: 9 }}>
              {judge.cache ? "em cache" : judge.sucesso === false ? "reserva" : "avaliado"}
            </div>
          </div>
        </div>

        <div
          title={`Pontuação ${pct}%`}
          style={{
            width: compact ? 32 : 38,
            height: compact ? 32 : 38,
            borderRadius: "50%",
            background: `conic-gradient(${cor} ${pct * 3.6}deg, ${T.s1 || "var(--bg)"} 0deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: compact ? 24 : 28,
              height: compact ? 24 : 28,
              borderRadius: "50%",
              background: T.s2 || "var(--social-bg)",
              color: cor,
              fontSize: compact ? 9 : 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {pct}
          </div>
        </div>
      </div>

      {problemas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ color: "#ef4444", fontSize: 10, fontWeight: 800 }}>Problemas</div>
          {problemas.slice(0, compact ? 2 : 4).map((item, idx) => (
            <div
              key={`problema-${idx}-${item.slice(0, 10)}`}
              style={{ color: T.ts || "var(--text)", fontSize: 11, lineHeight: 1.45 }}
            >
              - {item}
            </div>
          ))}
        </div>
      )}

      {validados.length > 0 && !compact && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ color: "#22c55e", fontSize: 10, fontWeight: 800 }}>Validados</div>
          {validados.slice(0, 3).map((item, idx) => (
            <div
              key={`validado-${idx}-${item.slice(0, 10)}`}
              style={{ color: T.ts || "var(--text)", fontSize: 11, lineHeight: 1.45 }}
            >
              - {item}
            </div>
          ))}
        </div>
      )}

      {resultado.recomendacao && (
        <div
          style={{
            color: T.tx || "var(--text-h)",
            background: T.s1 || "var(--bg)",
            border: `1px solid ${T.b1 || "var(--border)"}`,
            borderRadius: 6,
            padding: "6px 8px",
            fontSize: 11,
            lineHeight: 1.45,
          }}
        >
          {resultado.recomendacao}
        </div>
      )}
    </div>
  );
});

export default JudgeCard;
