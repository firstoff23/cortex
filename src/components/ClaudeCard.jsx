import React from "react";

const ClaudeCard = React.memo(function ClaudeCard({
  m,
  i,
  msgs,
  T,
  AC,
  CopyBtn,
  Markdown,
  showCouncil,
  setShowCouncil,
  isMobile,
  toast,
  children,
}) {
  return (
    <div
      style={{
        background: T.s1,
        border: `1px solid ${T.b1}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 10px 28px #00000020",
        animation: "fadeIn 250ms cubic-bezier(0.4,0,0.2,1), lobePop 250ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Cabeçalho da resposta do Córtex */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 14px",
          background: `linear-gradient(135deg, ${AC.claude}18 0%, ${AC.claude}08 100%)`,
          borderBottom: `1px solid ${T.b1}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              background: `${AC.claude}22`,
              border: `1px solid ${AC.claude}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: AC.claude,
              fontSize: 13,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            C
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.tx, letterSpacing: 0.4 }}>
              Córtex
            </div>
            <div style={{ fontSize: 10, color: T.ts }}>Síntese final do conselho</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <CopyBtn text={(m.structured?.final || m.content || "").trim()} T={T} />

          <button
            onClick={async () => {
              const finalText = (m.structured?.final || m.content || "").trim();
              const consensus = m.structured?.consensus?.length
                ? "\n\nConsenso:\n- " + m.structured.consensus.join("\n- ")
                : "";
              const divergence = m.structured?.divergence?.length
                ? "\n\nDivergências:\n- " + m.structured.divergence.join("\n- ")
                : "";
              const nextActions = m.structured?.nextActions?.length
                ? "\n\nPróximos passos:\n" +
                  m.structured.nextActions
                    .map(function (s, idx) {
                      return idx + 1 + ". " + s;
                    })
                    .join("\n")
                : "";
              const confidence = m.structured?.confidence
                ? "\n\nConfiança: " + m.structured.confidence
                : "";

              const question = msgs
                .slice(0, i)
                .reverse()
                .find((x) => x.role === "user")?.content || "";

              const shareText =
                "Pergunta:\n" +
                question +
                "\n\nResposta:\n" +
                finalText +
                consensus +
                divergence +
                nextActions +
                confidence;

              if (navigator.share && isMobile) {
                try {
                  await navigator.share({ text: shareText });
                } catch {}
              } else {
                await navigator.clipboard?.writeText(shareText);
                toast("Resposta copiada para partilha", "success");
              }
            }}
            title="Partilhar"
            style={{
              background: "transparent",
              border: `1px solid ${T.b1}`,
              borderRadius: 5,
              padding: "2px 7px",
              color: T.tf,
              fontSize: 9,
              cursor: "pointer",
            }}
          >
            📤
          </button>

          {m.lobeResults?.length > 0 && (
            <button
              onClick={() => setShowCouncil(showCouncil === m.id ? null : m.id)}
              title={showCouncil === m.id ? "Ocultar conselho" : "Ver conselho"}
              style={{
                background: showCouncil === m.id ? `${AC.claude}16` : "transparent",
                border: `1px solid ${showCouncil === m.id ? AC.claude + "44" : T.b1}`,
                borderRadius: 5,
                padding: "2px 7px",
                color: showCouncil === m.id ? AC.claude : T.tf,
                fontSize: 9,
                cursor: "pointer",
              }}
            >
              {showCouncil === m.id ? "Ocultar" : `🐺 ${m.lobeResults.length}`}
            </button>
          )}
        </div>
      </div>

      {/* Corpo da resposta */}
      <div style={{ padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Síntese antiga compatível */}
        {!m.structured?.final && m.content.includes("⚡ Síntese:") && (
          <div
            style={{
              background: `linear-gradient(135deg, ${AC.claude}14, ${AC.claude}08)`,
              border: `1px solid ${AC.claude}26`,
              borderRadius: 14,
              padding: "14px 15px",
              boxShadow: "inset 0 1px 0 #ffffff08",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                color: AC.claude,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.3,
              }}
            >
              <span style={{ fontSize: 15 }}>⚡</span>
              <span>Síntese</span>
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: T.tx,
                fontWeight: 600,
              }}
            >
              {(m.content.split("⚡ Síntese:")[1] || "").trim()}
            </div>
          </div>
        )}

        {/* Resposta principal */}
        <div style={{ paddingBottom: 4, borderBottom: `1px solid ${T.b1}` }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              color: AC.gemini,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.3,
            }}
          >
            <span>Resposta</span>
          </div>
          <Markdown text={(m.structured?.final || m.content || "").trim()} color={T.tx} faint={T.ts} />
        </div>

        {m.structured?.consensus?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${T.b1}`,
            }}
          >
            <div style={{ color: AC.gemini, fontSize: 11, fontWeight: 800, letterSpacing: 0.3 }}>
              Consenso
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {m.structured.consensus.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: T.s2,
                    border: `1px solid ${T.b1}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 11,
                    color: T.tx,
                    lineHeight: 1.6,
                  }}
                >
                  • {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {m.structured?.divergence?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${T.b1}`,
            }}
          >
            <div style={{ color: AC.grok, fontSize: 11, fontWeight: 800, letterSpacing: 0.3 }}>
              Divergências
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {m.structured.divergence.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: T.s2,
                    border: `1px solid ${T.b1}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 11,
                    color: T.tx,
                    lineHeight: 1.6,
                  }}
                >
                  • {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {m.structured?.nextActions?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${T.b1}`,
            }}
          >
            <div style={{ color: AC.perp, fontSize: 11, fontWeight: 800, letterSpacing: 0.3 }}>
              Próximos passos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {m.structured.nextActions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: T.s2,
                    border: `1px solid ${T.b1}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 11,
                    color: T.tx,
                    lineHeight: 1.6,
                  }}
                >
                  {idx + 1}. {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {m.structured?.confidence && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: T.tf }}>
            <span>Confiança</span>
            <span
              style={{
                color: AC.claude,
                fontWeight: 800,
                background: `${AC.claude}12`,
                border: `1px solid ${AC.claude}22`,
                borderRadius: 999,
                padding: "3px 8px",
              }}
            >
              {m.structured.confidence}
            </span>
          </div>
        )}

        {/* Pergunta refinada */}
        {m.refinedQuery && (
          <div style={{ fontSize: 9, color: T.tf, fontStyle: "italic", marginBottom: 4 }}>
            ✦ Pergunta refinada: "{m.refinedQuery}"
          </div>
        )}

        {/* Decisão do conselho */}
        {m.councilDecision && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${T.b1}`,
            }}
          >
            <div style={{ color: AC.perp, fontSize: 11, fontWeight: 800, letterSpacing: 0.3 }}>
              Decisão do conselho
            </div>
            <div style={{ fontSize: 12, color: T.ts, lineHeight: 1.7 }}>{m.councilDecision}</div>
          </div>
        )}

        {/* Memória usada */}
        {m.usedMemory?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ color: AC.grok, fontSize: 11, fontWeight: 800, letterSpacing: 0.3 }}>
              Memória utilizada
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {m.usedMemory.map((mem, j) => (
                <div
                  key={j}
                  style={{
                    background: T.s2,
                    border: `1px solid ${T.b1}`,
                    color: T.ts,
                    fontSize: 10,
                    lineHeight: 1.45,
                    padding: "6px 8px",
                    borderRadius: 10,
                    maxWidth: "100%",
                  }}
                >
                  {mem}
                </div>
              ))}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
});

export default ClaudeCard;
