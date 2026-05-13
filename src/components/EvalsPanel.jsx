export default function EvalsPanel({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "1rem",
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        style={{
          width: "min(420px, 100%)",
          maxHeight: "70vh",
          overflow: "auto",
          background: "var(--cor-fundo-2, #111827)",
          border: "1px solid var(--cor-borda, #374151)",
          borderRadius: "12px",
          padding: "1rem",
          color: "var(--cor-texto, #f9fafb)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <strong style={{ fontSize: "0.95rem" }}>Avaliações</strong>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--cor-borda, #374151)",
              borderRadius: "8px",
              color: "inherit",
              cursor: "pointer",
              padding: "0.25rem 0.55rem",
            }}
          >
            Fechar
          </button>
        </div>
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", opacity: 0.75 }}>
          Painel de avaliações em modo de desenvolvimento.
        </p>
      </section>
    </div>
  );
}
