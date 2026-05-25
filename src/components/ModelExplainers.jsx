import React from "react";

// ModelExplainers.jsx — Explica a função e modelo de cada lobo ativo.
// REGRA: CSS variables do projeto, ZERO inline style attributes.
export default function ModelExplainers({ activeLobes = [], judgeModel }) {
  
  return (
    <div className="cortex-model-explainers">
      <style>{`
        .cortex-model-explainers {
          background: var(--social-bg, #14141e);
          border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
          color: var(--text-h, #f5f5ff);
          font-family: inherit;
        }

        .cortex-explainers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          padding-bottom: 8px;
        }

        .cortex-explainers-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted, #8a8aa0);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .cortex-explainers-subtitle {
          font-size: 9px;
          color: var(--text-muted, #6b7280);
        }

        .cortex-explainers-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cortex-explainer-pill {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 44px; /* Touch target standard */
          transition: border-color 0.2s, background 0.2s;
        }

        .cortex-explainer-pill:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-hover, rgba(255, 255, 255, 0.15));
        }

        .cortex-explainer-pill-judge {
          background: rgba(167, 139, 250, 0.05); /* Purpurina subtil */
          border: 1px solid rgba(167, 139, 250, 0.25);
        }

        .cortex-explainer-pill-judge:hover {
          background: rgba(167, 139, 250, 0.08);
          border-color: rgba(167, 139, 250, 0.4);
        }

        .cortex-explainer-row1 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .cortex-explainer-name-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cortex-explainer-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent, #a78bfa);
        }

        .cortex-explainer-dot-judge {
          background: #a78bfa;
          box-shadow: 0 0 4px #a78bfa;
        }

        .cortex-explainer-name {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-h, #f5f5ff);
        }

        .cortex-explainer-role {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted, #8a8aa0);
          text-transform: uppercase;
        }

        .cortex-explainer-model {
          font-family: monospace;
          font-size: 9px;
          color: var(--text-muted, #8a8aa0);
          background: rgba(0, 0, 0, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          max-width: 180px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .cortex-explainer-reason {
          font-size: 11px;
          color: var(--text, #a8a8b8);
          line-height: 1.4;
          margin: 0;
        }
      `}</style>

      <div className="cortex-explainers-header">
        <span className="cortex-explainers-title">Modelos e Funções</span>
        <span className="cortex-explainers-subtitle">Mapeamento dinâmico</span>
      </div>

      <div className="cortex-explainers-list">
        {/* Claude / Rei do Córtex (Sempre Visível como Juiz) */}
        <div className="cortex-explainer-pill cortex-explainer-pill-judge">
          <div className="cortex-explainer-row1">
            <div className="cortex-explainer-name-group">
              <span className="cortex-explainer-dot cortex-explainer-dot-judge" />
              <span className="cortex-explainer-name">Rei do Córtex</span>
              <span className="cortex-explainer-role">(Orquestrador)</span>
            </div>
            <span className="cortex-explainer-model" title={judgeModel || "Claude / Llama"}>
              {judgeModel || "meta-llama/llama-3.3-70b-instruct:free"}
            </span>
          </div>
          <p className="cortex-explainer-reason">
            Avalia as opiniões dos lobos do conselho, cruza argumentos, resolve contradições e formula o veredicto final fundamentado.
          </p>
        </div>

        {/* Lobos ativos listados dinamicamente via props */}
        {activeLobes.length > 0 ? (
          activeLobes.map((lobe, idx) => (
            <div key={`explainer-lobe-${idx}-${lobe.name}`} className="cortex-explainer-pill">
              <div className="cortex-explainer-row1">
                <div className="cortex-explainer-name-group">
                  <span className="cortex-explainer-dot" />
                  <span className="cortex-explainer-name">{lobe.name}</span>
                  {lobe.role && <span className="cortex-explainer-role">({lobe.role})</span>}
                </div>
                <span className="cortex-explainer-model" title={lobe.model}>
                  {lobe.model}
                </span>
              </div>
              <p className="cortex-explainer-reason">
                {lobe.reason || "Contribui com perspetivas especializadas para enriquecer a discussão paralela do conselho."}
              </p>
            </div>
          ))
        ) : (
          <div className="cortex-explainer-reason" style={{ textAlign: "center", padding: "10px 0" }}>
            Nenhum lobo ativo disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
}
