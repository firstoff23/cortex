import React from "react";

// QuickActionsBar.jsx — Barra horizontal de ações rápidas no fundo do chat.
export default function QuickActionsBar({ onAction, msgs, T, AC, disabled }) {
  const temMensagens = msgs && msgs.length > 0;
  const temVeredicto = msgs && msgs.some(m => m.role === "assistant");

  const acoes = [
    {
      id: "resumir",
      label: "📝 Resumir",
      color: AC?.gemini || "#10b981",
      descr: "Gera um resumo rápido do debate atual",
      disabled: !temMensagens || disabled,
    },
    {
      id: "forense",
      label: "🕵️ Modo Forense",
      color: AC?.perp || "#3b82f6",
      descr: "Abre o painel de diagnóstico da memória e RAG",
      disabled: disabled,
    },
    {
      id: "copiar",
      label: "📋 Copiar Resposta",
      color: AC?.claude || "#a78bfa",
      descr: "Copia o último veredicto do Rei para a área de transferência",
      disabled: !temVeredicto || disabled,
    },
    {
      id: "exportar",
      label: "📤 Exportar",
      color: AC?.genspark || "#ec4899",
      descr: "Abre as opções de exportação do relatório",
      disabled: !temMensagens || disabled,
    }
  ];

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        background: T?.bg || "rgba(20, 20, 30, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${T?.b2 || "rgba(255,255,255,0.06)"}`,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          width: "100%",
          maxWidth: 820,
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
          padding: "2px 0",
          alignItems: "center",
        }}
        className="quick-actions-scroll"
      >
        <style>{`
          .quick-actions-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {acoes.map((acao) => (
          <button
            key={acao.id}
            type="button"
            title={acao.descr}
            onClick={() => !acao.disabled && onAction(acao.id)}
            disabled={acao.disabled}
            style={{
              flex: "0 0 auto",
              background: acao.disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${acao.disabled ? "rgba(255,255,255,0.02)" : T?.b1 || "rgba(255,255,255,0.08)"}`,
              borderRadius: 12,
              padding: "8px 16px",
              color: acao.disabled ? T?.tf || "#6b7280" : T?.tx || "#f5f5ff",
              fontSize: 11,
              fontWeight: 600,
              cursor: acao.disabled ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              minHeight: 44, // 44px mobile touch target
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: acao.disabled ? 0.45 : 1,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!acao.disabled) {
                e.currentTarget.style.borderColor = acao.color;
                e.currentTarget.style.background = `${acao.color}0c`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!acao.disabled) {
                e.currentTarget.style.borderColor = T?.b1 || "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.transform = "none";
              }
            }}
          >
            {acao.label}
          </button>
        ))}
      </div>
    </div>
  );
}
