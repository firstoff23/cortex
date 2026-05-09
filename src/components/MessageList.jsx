import React from "react";
import LobeCard from "./LobeCard";
import ClaudeCard from "./ClaudeCard";

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
}) {
  const ClaudeCardView = ClaudeCardComponent;

  return (
    <>
      {msgs.map((m, i) => (
        <div
          key={m.id || i}
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
                      key={l._key || l.id || idx}
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
                    />
                  ))}
                </div>
              )}
            </ClaudeCardView>
          )}
        </div>
      ))}
    </>
  );
});

export default MessageList;
