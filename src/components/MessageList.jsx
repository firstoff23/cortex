import React from "react";
import LobeCard from "./LobeCard";
import ClaudeCard from "./ClaudeCard";

const GENERIC_ERROR_SUGGESTIONS = new Set([
  "Tenta reformular a pergunta",
  "Reporta o erro",
  "Continua sem juízes",
]);

const MessageList = React.memo(function MessageList({
  msgs,
  T,
  AC,
  CopyBtn,
  Markdown,
  showCouncil,
  setShowCouncil,
  isMobile,
  phase,
  setPhase,
  setMsgs,
  buildMem,
  brain,
  invoke,
  P,
  toast,
  ClaudeCardComponent = ClaudeCard,
  BeforeVerdictComponent,
  textosParciais,
  aStreaming,
  onSuggestionClick = () => {},
}) {
  const ClaudeCardView = ClaudeCardComponent;

  return (
    <>
      {msgs.map((m, i) => {
        const sugestoesRei = [
          ...(m.king?.suggestions || []),
          ...(m.sugestoes || []),
          ...(m.structured?.nextActions || []),
        ]
          .filter(Boolean)
          .filter((sugestao) => !GENERIC_ERROR_SUGGESTIONS.has(String(sugestao)))
          .slice(0, 3);

        return (
          <div
          key={`msg-${i}-${m.id || m.role || "sem-id"}`}
          className="msg-in"
          style={{
            alignSelf: m.role === "user" ? "flex-end" : "stretch",
            maxWidth: m.role === "user" ? "82%" : "100%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {m.role === "user" ? (
            <div
              style={{
                alignSelf: "flex-end",
                background: `linear-gradient(135deg, ${AC.claude}22, ${AC.claude}10)`,
                border: `1px solid ${AC.claude}44`,
                color: T.tx,
                borderRadius: "18px 18px 6px 18px",
                padding: "12px 14px",
                fontSize: 13,
                lineHeight: 1.65,
                boxShadow: "0 6px 22px #00000022",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {m.content}
              {m.anexo?.previewUrl && (
                <img
                  src={m.anexo.previewUrl}
                  alt={m.anexo.nome || "Imagem anexada"}
                  style={{
                    display: "block",
                    marginTop: 10,
                    maxWidth: "100%",
                    maxHeight: 180,
                    borderRadius: 10,
                    objectFit: "cover",
                  }}
                />
              )}
              {m.anexo && !m.anexo.previewUrl && (
                <div
                  style={{
                    marginTop: 8,
                    border: `1px solid ${AC.claude}33`,
                    borderRadius: 10,
                    padding: "6px 9px",
                    fontSize: 11,
                    color: T.ts,
                  }}
                >
                  📎 {m.anexo.nome}
                </div>
              )}
              {m.complexity && (
                <div
                  style={{
                    fontSize: 9,
                    marginTop: 5,
                    opacity: 0.7,
                    textAlign: "right",
                    color:
                      m.complexity === "SIMPLE"
                        ? AC.perp
                        : m.complexity === "MEDIUM"
                        ? AC.grok
                        : AC.claude,
                  }}
                >
                  {m.complexity === "SIMPLE"
                    ? "⚡ Simples"
                    : m.complexity === "MEDIUM"
                    ? "⚙️ Médio"
                    : "🧠 Complexo"}
                </div>
              )}
            </div>
          ) : m.systemNote ? (
            <div
              style={{
                alignSelf: "center",
                fontSize: 10,
                color: m.compressNote ? AC.perp : AC.claude,
                background: m.compressNote ? `${AC.perp}12` : `${AC.claude}12`,
                border: `1px solid ${m.compressNote ? AC.perp : AC.claude}22`,
                borderRadius: 999,
                padding: "6px 10px",
                letterSpacing: 0.2,
              }}
            >
              {m.content}
            </div>
          ) : (
            <ClaudeCardView
              m={m}
              i={i}
              msgs={msgs}
              T={T}
              AC={AC}
              CopyBtn={CopyBtn}
              Markdown={Markdown}
              showCouncil={showCouncil}
              setShowCouncil={setShowCouncil}
              isMobile={isMobile}
              toast={toast}
              beforeVerdict={
                BeforeVerdictComponent && m.modoDebate ? (
                  <BeforeVerdictComponent
                    ronda1={m.debate?.ronda1}
                    ronda2={m.debate?.ronda2}
                    modoDebate={m.modoDebate}
                  />
                ) : null
              }
            >
              {/* Conselho expandido */}
              {showCouncil === m.id && m.lobeResults?.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))",
                    gap: 10,
                    paddingTop: 2,
                  }}
                >
                  {m.lobeResults.map((l, idx) => (
                    <LobeCard
                      key={`lobe-${l.id}-${idx}`}
                      l={l}
                      idx={idx}
                      T={T}
                      phase={phase}
                      msgs={msgs}
                      i={i}
                      m={m}
                      setPhase={setPhase}
                      setMsgs={setMsgs}
                      buildMem={buildMem}
                      brain={brain}
                      invoke={invoke}
                      P={P}
                      Markdown={Markdown}
                      textosParciais={textosParciais}
                      aStreaming={aStreaming}
                    />
                  ))}
                </div>
              )}
              {sugestoesRei.length > 0 && (
                <div
                  style={{
                    display: "inline-flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "8px",
                  }}
                >
                  {sugestoesRei.map((sugestao, idx) => (
                    <button
                      key={`sugestao-rei-${m.id || i}-${idx}`}
                      type="button"
                      onClick={() => onSuggestionClick(sugestao)}
                      style={{
                        border: "1px solid var(--accent)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "13px",
                        cursor: "pointer",
                        background: "transparent",
                        color: "var(--accent)",
                        transition: "background 0.2s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(168,85,247,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              )}
            </ClaudeCardView>
          )}
        </div>
        );
      })}
    </>
  );
});

export default MessageList;
