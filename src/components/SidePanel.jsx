import React, { useEffect } from "react";

// SidePanel.jsx — painel lateral direito com sobreposição e ESC.
export default function SidePanel({ aberto, onFechar, titulo, children, largura }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onFechar?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aberto, onFechar]);

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
          transform: aberto ? "translateX(0)" : "translateX(104%)",
          transition: "transform 0.3s ease",
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
          <strong style={{ color: "var(--text-h, #f5f5ff)", fontSize: 13 }}>{titulo}</strong>
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
              width: 30,
              height: 30,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>{children}</div>
      </aside>
    </>
  );
}
