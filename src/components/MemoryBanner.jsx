export default function MemoryBanner({ onUsarContexto, onIgnorar }) {
  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto 10px",
        background: "rgba(59,130,246,0.10)",
        border: "1px solid rgba(59,130,246,0.32)",
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ minWidth: 220, flex: 1 }}>
        <div
          style={{
            color: "var(--text-h, #e8e8f8)",
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 3,
          }}
        >
          Tens contexto de uma sessão anterior.
        </div>
        <div style={{ color: "var(--text-muted, #8a8aa0)", fontSize: 12, lineHeight: 1.45 }}>
          Queres continuar de onde ficaste?
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onUsarContexto}
          style={{
            background: "var(--accent, #a855f7)",
            border: "1px solid var(--accent, #a855f7)",
            borderRadius: 999,
            color: "#ffffff",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 800,
            padding: "7px 12px",
          }}
        >
          Sim, usar contexto
        </button>
        <button
          type="button"
          onClick={onIgnorar}
          style={{
            background: "transparent",
            border: "1px solid rgba(59,130,246,0.35)",
            borderRadius: 999,
            color: "var(--text-secondary, #9ca3af)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
            padding: "7px 12px",
          }}
        >
          Não, começar do zero
        </button>
      </div>
    </div>
  );
}
