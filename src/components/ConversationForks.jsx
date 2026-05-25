import React from "react";

// ConversationForks.jsx — Permite bifurcar conversas e gerir ramos de debates existentes.
export default function ConversationForks({ currentTurnId, forks = [], onFork, onSelectTurn, T, AC }) {
  const accentColor = AC?.claude || "#a78bfa";

  return (
    <div
      style={{
        background: T?.s2 || "rgba(255, 255, 255, 0.02)",
        border: `1px solid ${T?.b1 || "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 12,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T?.ts || "#8a8aa0", textTransform: "uppercase", letterSpacing: 0.8 }}>
          Bifurcações do Debate (Forks)
        </span>
        <span style={{ fontSize: 9, color: T?.tf || "#6b7280" }}>
          Explora caminhos alternativos
        </span>
      </div>

      {/* Botão para criar novo fork a partir do Turn/Estado atual */}
      <button
        type="button"
        onClick={() => onFork?.(currentTurnId)}
        style={{
          background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
          border: `1px solid ${accentColor}44`,
          borderRadius: 8,
          color: T?.tx || "#f5f5ff",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          minHeight: 44, // 44px mobile touch target
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "all 0.2s ease-in-out",
          width: "100%",
          fontFamily: "inherit"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${accentColor}2c`;
          e.currentTarget.style.borderColor = accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${accentColor}18`;
          e.currentTarget.style.borderColor = `${accentColor}44`;
        }}
      >
        🌿 Criar fork a partir daqui
      </button>

      {/* Lista de forks existentes */}
      {forks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T?.ts || "#8a8aa0", textTransform: "uppercase", marginBottom: 2 }}>
            Caminhos Guardados
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 180,
              overflowY: "auto",
              paddingRight: 2
            }}
          >
            {forks.map((fork, index) => {
              const isActive = fork.turnId === currentTurnId;
              const dateStr = fork.timestamp
                ? new Date(fork.timestamp).toLocaleString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit"
                  })
                : "";

              return (
                <div
                  key={`fork-item-${index}-${fork.turnId}`}
                  onClick={() => onSelectTurn?.(fork.turnId)}
                  style={{
                    background: isActive ? `${accentColor}0f` : "rgba(255, 255, 255, 0.01)",
                    border: `1px solid ${isActive ? accentColor : T?.b1 || "rgba(255, 255, 255, 0.06)"}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    transition: "all 0.15s ease",
                    minHeight: 44 // Touch target compliant
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      e.currentTarget.style.borderColor = T?.b2 || "rgba(255, 255, 255, 0.12)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                      e.currentTarget.style.borderColor = T?.b1 || "rgba(255, 255, 255, 0.06)";
                    }
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 600, color: T?.tx || "#f5f5ff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {fork.title || `Bifurcação #${index + 1}`}
                    </span>
                    {dateStr && (
                      <span style={{ fontSize: 9, color: T?.tf || "#6b7280" }}>
                        {dateStr}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: accentColor }}>
                      Ativo
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 10, color: T?.tf || "#6b7280", textAlign: "center", padding: "8px 0" }}>
          Nenhum caminho alternativo criado ainda.
        </div>
      )}
    </div>
  );
}
