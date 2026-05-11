import React from "react";

// ChatBubble.jsx — bolha nativa inspirada em padrões de AI chat do 21st.dev.
export default function ChatBubble({
  papel = "assistant",
  nome,
  cor = "var(--accent, #10b981)",
  destaque = false,
  children,
  meta,
}) {
  const isUser = papel === "user";
  const isRei = papel === "rei" || destaque;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        width: "100%",
        gap: 5,
      }}
    >
      {!isUser && nome && (
        <div
          style={{
            color: isRei ? "var(--accent, #10b981)" : cor,
            fontSize: 11,
            fontWeight: 850,
            letterSpacing: 0,
            paddingLeft: 2,
          }}
        >
          {nome}
        </div>
      )}

      <div
        style={{
          maxWidth: "100%",
          alignSelf: isUser ? "flex-end" : "flex-start",
          background: isUser
            ? "linear-gradient(135deg, rgba(16,185,129,0.20), rgba(16,185,129,0.08))"
            : isRei
              ? "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(139,92,246,0.10))"
              : "var(--social-bg, rgba(255,255,255,0.04))",
          border: isUser
            ? "1px solid rgba(16,185,129,0.35)"
            : `1px solid ${isRei ? "rgba(16,185,129,0.38)" : `${cor}44`}`,
          borderRadius: isUser ? "18px 18px 6px 18px" : "6px 18px 18px 18px",
          color: "var(--text-h, #f5f5ff)",
          padding: "12px 14px",
          fontSize: 13,
          lineHeight: 1.65,
          boxShadow: isRei ? "0 10px 28px rgba(16,185,129,0.12)" : "0 6px 22px rgba(0,0,0,0.18)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {children}
        {meta && (
          <div
            style={{
              marginTop: 7,
              fontSize: 10,
              color: "var(--text-muted, var(--text, #8a8aa0))",
              textAlign: isUser ? "right" : "left",
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}
