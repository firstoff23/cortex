import React, { useCallback, useState } from "react";

// Toast.jsx — notificações nativas sem Sonner/Radix.
const TIPOS = {
  erro: { cor: "#ef4444", icone: "⚠" },
  error: { cor: "#ef4444", icone: "⚠" },
  aviso: { cor: "#f59e0b", icone: "!" },
  info: { cor: "#3b82f6", icone: "ℹ" },
  sucesso: { cor: "#22c55e", icone: "✓" },
  success: { cor: "#22c55e", icone: "✓" },
};

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removerToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((mensagem, tipo = "erro") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => removerToast(id), 4000);
    return id;
  }, [removerToast]);

  return { toasts, toast, removerToast };
}

export default function Toast({ toasts = [], onFechar }) {
  return (
    <div
      aria-live="polite"
      aria-label="Notificações"
      style={{
        position: "fixed",
        right: 16,
        bottom: 86,
        zIndex: 2200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes toastSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      {toasts.map((item) => {
        const variante = TIPOS[item.tipo] || TIPOS.erro;
        return (
          <div
            key={item.id}
            role={item.tipo === "erro" || item.tipo === "error" ? "alert" : "status"}
            style={{
              width: "min(340px, calc(100vw - 32px))",
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "var(--social-bg, #14141e)",
              border: `1px solid ${variante.cor}55`,
              borderRadius: 12,
              padding: "10px 12px",
              color: "var(--text-h, #f5f5ff)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
              pointerEvents: "all",
              animation: "toastSlideIn 0.2s ease",
              fontSize: 12,
            }}
          >
            <span style={{ color: variante.cor, fontWeight: 900 }}>{variante.icone}</span>
            <span style={{ flex: 1, lineHeight: 1.45 }}>{item.mensagem}</span>
            <button
              type="button"
              aria-label="Fechar notificação"
              onClick={() => onFechar?.(item.id)}
              style={{
                background: "transparent",
                border: "none",
                color: variante.cor,
                cursor: "pointer",
                fontSize: 14,
                padding: 2,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
