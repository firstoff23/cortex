import { classifyError } from "../utils/errorMessages.js";

export function obterHandlerAccao(accao, { onRetry, onChangeModel, onSettings } = {}) {
  if (accao === "Tentar novamente") return onRetry || null;
  if (accao === "Verificar ligação e tentar novamente") return onRetry || null;
  if (accao === "Escolher outro modelo") return onChangeModel || null;
  if (accao === "Verificar definições") return onSettings || null;
  return null;
}

export default function ErrorMessage({ error, onRetry, onChangeModel, onSettings }) {
  const erro = classifyError(error);
  const handler = obterHandlerAccao(erro.accao, { onRetry, onChangeModel, onSettings });

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        background: "rgba(239,68,68,0.10)",
        border: "1px solid rgba(239,68,68,0.32)",
        borderRadius: 8,
        padding: "8px 10px",
        color: "var(--text-primary, #f5f5ff)",
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      <span aria-hidden="true" style={{ color: "#f87171", flexShrink: 0 }}>
        ⚠
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
        <span>{erro.mensagem}</span>
        {handler && (
          <button
            type="button"
            onClick={handler}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              border: "none",
              color: "#fca5a5",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 800,
              padding: 0,
            }}
          >
            {erro.accao}
          </button>
        )}
      </span>
    </div>
  );
}
