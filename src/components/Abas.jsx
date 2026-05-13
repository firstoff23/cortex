import React, { useState } from "react";

// Abas.jsx — abas acessíveis sem Radix.
export default function Abas({ abas = [], defaultActiva }) {
  const primeira = defaultActiva || abas[0]?.id;
  const [activa, setActiva] = useState(primeira);
  const abaActual = abas.find((aba) => aba.id === activa) || abas[0];

  if (!abas.length) return null;

  return (
    <div>
      <div role="tablist" style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border, rgba(255,255,255,0.12))" }}>
        {abas.map((aba) => {
          const selected = aba.id === abaActual?.id;
          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiva(aba.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: selected ? "2px solid var(--accent, #10b981)" : "2px solid transparent",
                color: selected ? "var(--text-h, #f5f5ff)" : "var(--text, #8a8aa0)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: selected ? 850 : 650,
                padding: "8px 10px",
              }}
            >
              {aba.titulo}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" style={{ paddingTop: 10 }}>
        {abaActual?.conteudo}
      </div>
    </div>
  );
}
