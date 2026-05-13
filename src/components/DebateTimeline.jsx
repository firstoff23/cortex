import React, { useState } from "react";
import Abas from "./Abas.jsx";

function valorLobe(item) {
  if (!item) return null;
  if (item.status === "fulfilled") return item.value;
  if (item.status === "rejected") {
    return {
      nome: "Lobo indisponível",
      resposta: item.reason?.message || "Falha ao obter resposta.",
    };
  }
  return item;
}

function RondaSection({ titulo, lobos, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const itens = (lobos || []).map(valorLobe).filter(Boolean);

  return (
    <div
      style={{
        border: "1px solid var(--cor-borda, var(--border, #2a2a3a))",
        borderRadius: "8px",
        background: "var(--cor-fundo-2, var(--social-bg, #14141e))",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          background: "transparent",
          border: "none",
          color: "var(--cor-texto, var(--text-h, #e8e8f8))",
          cursor: "pointer",
          padding: "9px 10px",
          font: "inherit",
          fontSize: "0.82rem",
          fontWeight: 800,
          textAlign: "left",
        }}
      >
        <span>{titulo}</span>
        <span style={{ color: "var(--text-muted, #8a8aa0)", fontSize: "0.75rem" }}>
          {open ? "▼" : "▶"}
        </span>
      </button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "0 10px 10px",
          }}
        >
          {itens.map((lobe, idx) => (
            <div
              key={`debate-lobe-${idx}-${lobe.nome || lobe.id}`}
              style={{
                borderTop: "1px solid var(--cor-borda, var(--border, #2a2a3a))",
                paddingTop: "8px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "var(--cor-texto, var(--text-h, #e8e8f8))",
                  fontSize: "0.78rem",
                  marginBottom: "4px",
                }}
              >
                {lobe.nome || `Lobo ${idx + 1}`}
              </strong>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted, var(--text, #a0a0b8))",
                  fontSize: "0.78rem",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {lobe.resposta || lobe.result || "Sem resposta."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DebateTimeline({ ronda1, ronda2, modoDebate }) {
  if (!modoDebate) return null;

  return (
    <div
      className="debate-timeline"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        paddingBottom: "4px",
        borderBottom: "1px solid var(--cor-borda, var(--border, #2a2a3a))",
      }}
    >
      <Abas
        defaultActiva="veredicto"
        abas={[
          {
            id: "ronda1",
            titulo: "Ronda 1",
            conteudo: (
              <RondaSection
                titulo="Posições iniciais"
                lobos={ronda1}
                defaultOpen={false}
              />
            ),
          },
          {
            id: "ronda2",
            titulo: "Ronda 2",
            conteudo: (
              <RondaSection
                titulo="Reacções"
                lobos={ronda2}
                defaultOpen={false}
              />
            ),
          },
          {
            id: "veredicto",
            titulo: "Veredicto",
            conteudo: (
              <div
                style={{
                  border: "1px solid var(--cor-borda, var(--border, #2a2a3a))",
                  borderRadius: "8px",
                  background: "var(--cor-fundo-2, var(--social-bg, #14141e))",
                  padding: "10px",
                  color: "var(--text-muted, var(--text, #a0a0b8))",
                  fontSize: "0.78rem",
                  lineHeight: 1.55,
                }}
              >
                O Rei cruza as rondas dos lobos e mostra a síntese final abaixo.
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
