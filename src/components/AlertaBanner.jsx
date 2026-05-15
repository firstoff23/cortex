import React from "react";

// AlertaBanner.jsx — alerta inline sem Radix/shadcn.
const VARIANTES = {
  erro: { cor: "#ef4444", icone: "⚠" },
  aviso: { cor: "#f59e0b", icone: "!" },
  info: { cor: "#3b82f6", icone: "ℹ" },
  sucesso: { cor: "#22c55e", icone: "✓" },
};

export default function AlertaBanner({ tipo = "info", mensagem, onFechar, children }) {
  if (!mensagem) return null;
  const v = VARIANTES[tipo] || VARIANTES.info;

  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 9,
        border: `1px solid ${v.cor}55`,
        background: `${v.cor}14`,
        color: "var(--text-h, #f5f5ff)",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          aria-hidden="true"
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${v.cor}22`,
            color: v.cor,
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {v.icone}
        </span>
        <span style={{ flex: 1 }}>{mensagem}</span>
        {onFechar && (
          <button
            type="button"
            aria-label="Fechar alerta"
            onClick={onFechar}
            style={{
              background: "transparent",
              border: "none",
              color: v.cor,
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        )}
      </div>
      {children && <div style={{ marginTop: 2 }}>{children}</div>}
    </div>
  );
}
