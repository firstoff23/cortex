import React from "react";

const LobeCard = React.memo(function LobeCard({
  l,
  idx,
  T,
  phase,
  msgs,
  i,
  m,
  setPhase,
  setMsgs,
  buildMem,
  brain,
  invoke,
  P,
  Markdown,
}) {
  return (
    <div
      className="lobe-card"
      style={{
        position: "relative",
        background: T.s2,
        border: `1px solid ${l.color}33`,
        borderRadius: 14,
        padding: "12px 12px 10px",
        boxShadow: "0 4px 14px #00000016",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: `${l.color}20`,
              border: `1px solid ${l.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {["🔍", "💡", "⚙️", "🌐", "😈"][idx] || "🐺"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: l.color, letterSpacing: 0.3 }}>
              {l.label}
            </div>
            <div
              style={{
                fontSize: 9,
                color: T.tf,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {l.srcModel}
              {l.srcReal === false ? " · simulado" : ""}
            </div>
          </div>
        </div>

        {/* Anel de confiança, latência e botão ao mesmo nível */}
        {l.confidence != null && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `conic-gradient(${l.color} ${l.confidence * 3.6}deg, ${T.s2} 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: T.s2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: l.color,
                fontWeight: 800,
              }}
            >
              {l.confidence}
            </div>
          </div>
        )}
        {/* Latência */}
        {l.latency && (
          <span
            style={{
              fontSize: 8,
              color: T.tf,
              background: T.s1,
              border: `1px solid ${T.b1}`,
              borderRadius: 999,
              padding: "2px 6px",
              flexShrink: 0,
            }}
          >
            ⏱ {l.latency}ms
          </span>
        )}
        <button
          onClick={async () => {
            if (phase) return;
            const q = msgs
              .slice(0, i)
              .reverse()
              .find((x) => x.role === "user")?.content;
            if (!q) return;
            setPhase("council");
            setMsgs((prev) =>
              prev.map((msg) => {
                if (msg.id !== m.id) return msg;
                return {
                  ...msg,
                  lobeResults: (msg.lobeResults || []).map((item) =>
                    item.id === l.id
                      ? { ...item, result: "A regenerar...", isErr: false, regenerating: true }
                      : item
                  ),
                };
              })
            );
            try {
              const mem = buildMem(brain);
              const r = await invoke(l.id, P[l.id]?.(mem, q) || `Answer: ${q}`, q);
              setMsgs((prev) =>
                prev.map((msg) => {
                  if (msg.id !== m.id) return msg;
                  return {
                    ...msg,
                    lobeResults: (msg.lobeResults || []).map((item) =>
                      item.id === l.id
                        ? {
                            ...item,
                            result: r.result,
                            srcModel: r.model,
                            srcReal: r.real,
                            isErr:
                              !r.result || r.result.startsWith("[") || r.result.startsWith("Tempo"),
                            regenerating: false,
                          }
                        : item
                    ),
                  };
                })
              );
            } catch {
              setMsgs((prev) =>
                prev.map((msg) => {
                  if (msg.id !== m.id) return msg;
                  return {
                    ...msg,
                    lobeResults: (msg.lobeResults || []).map((item) =>
                      item.id === l.id ? { ...item, regenerating: false } : item
                    ),
                  };
                })
              );
            }
            setPhase(null);
          }}
          title="Regenerar lobe"
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            border: `1px solid ${T.b1}`,
            background: "transparent",
            color: l.regenerating ? l.color : T.ts,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {l.regenerating ? "◌" : "🔄"}
        </button>
      </div>

      <div
        style={{
          minHeight: 54,
          fontSize: 12,
          color: l.isErr ? "#fca5a5" : T.tx,
          lineHeight: 1.65,
        }}
      >
        <Markdown text={l.result || ""} color={l.isErr ? "#fca5a5" : T.tx} faint={T.ts} />
      </div>
    </div>
  );
});

export default LobeCard;
