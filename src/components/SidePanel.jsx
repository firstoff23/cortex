import React, { useEffect, useRef, useState } from "react";
import useMobile from "../hooks/useMobile.js";
import ExportPanel from "./ExportPanel.jsx";

// SidePanel.jsx — painel lateral direito com sobreposição e ESC.
export default function SidePanel({ aberto, onFechar, titulo, children, largura, exportData }) {
  const { isMobile } = useMobile();
  const touchStartY = useRef(0);
  const [view, setView] = useState("default");

  useEffect(() => {
    if (!aberto) {
      setView("default"); // Reset ao fechar
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onFechar?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aberto, onFechar]);

  const onTouchStart = (e) => (touchStartY.current = e.touches[0].clientY);
  const onTouchEnd = (e) => {
    if (!isMobile) return;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (diffY > 50) onFechar?.(); // Swipe down para fechar no mobile
  };

  const T = exportData?.T || {};
  const accentColor = exportData?.AC?.claude || "#a78bfa";

  return (
    <>
      <div
        onClick={onFechar}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 498,
          background: aberto ? "rgba(0,0,0,0.45)" : "transparent",
          opacity: aberto ? 1 : 0,
          pointerEvents: aberto ? "auto" : "none",
          transition: "opacity 0.3s ease, background 0.3s ease",
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={aberto ? 0 : -1}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 499,
          width: largura || "min(360px, 92vw)",
          background: "var(--social-bg, #14141e)",
          borderLeft: "1px solid var(--border, rgba(255,255,255,0.12))",
          boxShadow: "-18px 0 42px rgba(0,0,0,0.38)",
          transform: aberto ? "none" : "translateX(104%)",
          transition: aberto ? "none" : "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid var(--border, rgba(255,255,255,0.12))",
          }}
        >
          <strong style={{ color: "var(--text-h, #f5f5ff)", fontSize: 13 }}>
            {view === "export" ? "Exportar Relatório" : titulo}
          </strong>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {exportData && (
              <button
                type="button"
                onClick={() => setView(v => v === "export" ? "default" : "export")}
                style={{
                  background: view === "export" ? "rgba(255,255,255,0.06)" : "transparent",
                  border: `1px solid ${view === "export" ? accentColor : "var(--border, rgba(255,255,255,0.12))"}`,
                  borderRadius: 8,
                  color: view === "export" ? accentColor : "var(--text, #8a8aa0)",
                  cursor: "pointer",
                  fontSize: 11,
                  padding: "4px 8px",
                  fontWeight: 700,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit",
                }}
              >
                {view === "export" ? "← Voltar" : "📤 Exportar"}
              </button>
            )}
            <button
              type="button"
              aria-label="Fechar painel"
              onClick={onFechar}
              style={{
                background: "transparent",
                border: "1px solid var(--border, rgba(255,255,255,0.12))",
                borderRadius: 8,
                color: "var(--text, #8a8aa0)",
                cursor: "pointer",
                fontSize: 14,
                minWidth: 44,
                minHeight: 44,
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {view === "export" && exportData ? (
            <ExportPanel
              msgs={exportData.msgs}
              T={T}
              AC={exportData.AC}
              toast={exportData.toast}
              onClose={() => setView("default")}
            />
          ) : (
            children
          )}
        </div>
      </aside>
    </>
  );
}

