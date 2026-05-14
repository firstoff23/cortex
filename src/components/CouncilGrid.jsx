import React, { useState } from 'react';
import LobeLoader from './LobeLoader';

/**
 * CouncilGrid — UI Mobile-First para o Debate do Conselho
 * 
 * @param {Array} lobos - Lista de definições oficiais dos lobos (LOBOS)
 * @param {Array} resultados - Resultados finais (m.lobeResults)
 * @param {Object} parciais - Textos em streaming (textosParciais)
 * @param {string} fase - Fase actual (phase)
 * @param {boolean} aStreaming - Se está a decorrer streaming global
 */
export default function CouncilGrid({ 
  lobos = [], 
  resultados = [], 
  parciais = {}, 
  fase, 
  aStreaming,
  isMobile 
}) {
  const [selecionado, setSelecionado] = useState(null);

  const fases = ["Respostas", "Crítica", "Síntese", "Veredicto"];
  const fasesInternas = {
    "council": 0,
    "judges": 1,
    "rei": 2,
    "cortex": 2,
    "reflex": 3
  };
  const indiceFase = fasesInternas[fase] ?? -1;

  // Mapeia o estado de cada lobo
  const getLoboStatus = (id) => {
    const resFinal = resultados.find(r => String(r.id).includes(String(id)));
    if (resFinal) return resFinal.isErr ? 'error' : 'done';
    if (parciais[id]) return 'writing';
    if (aStreaming && fase === 'council') return 'thinking';
    return 'idle';
  };

  const getLoboText = (id) => {
    const resFinal = resultados.find(r => String(r.id).includes(String(id)));
    return resFinal?.result || parciais[id] || "";
  };

  return (
    <div className="council-container msg-in">
      {/* Stepper de Pipeline */}
      <div className="pipeline-stepper">
        {fases.map((f, i) => (
          <div key={f} className={`step ${i <= indiceFase ? 'active' : ''} ${i === indiceFase ? 'current' : ''}`}>
            <span className="step-dot" />
            <span className="step-label">{f}</span>
          </div>
        ))}
      </div>

      {/* Grid de Lobos */}
      <div className={`lobes-grid ${isMobile ? 'mobile' : ''}`}>
        {lobos.map((lobo, idx) => {
          const status = getLoboStatus(lobo.id);
          const texto = getLoboText(lobo.id);
          const icon = ["◉", "◈", "◐", "◑", "◒"][idx] || "◌";
          
          return (
            <div 
              key={lobo.id} 
              className={`lobo-card ${status}`}
              onClick={() => texto && setSelecionado({ ...lobo, resposta: texto, icon })}
              style={{ '--accent-lobe': lobo.cor || lobo.color }}
            >
              <div className="lobo-header">
                <span className="lobo-icon" style={{ color: lobo.cor || lobo.color }}>{icon}</span>
                <div className={`status-indicator ${status}`} />
              </div>
              <div className="lobo-info">
                <span className="lobo-nome">{lobo.nome.split(' ')[0]}</span>
              </div>
              {status === 'thinking' && <div className="mini-loader"><LobeLoader tamanho={10} texto="" cor={lobo.cor} /></div>}
              {texto && (
                <p className="lobo-preview">
                  {texto.slice(0, 60)}...
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet para detalhe */}
      {selecionado && (
        <div className="bottom-sheet-overlay" onClick={() => setSelecionado(null)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span className="lobo-icon-large" style={{ color: selecionado.cor || selecionado.color }}>{selecionado.icon}</span>
              <h3>{selecionado.nome}</h3>
              <button className="close-sheet" onClick={() => setSelecionado(null)}>Fechar</button>
            </div>
            <div className="full-argument">
              {selecionado.resposta}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .council-container { 
          padding: 14px; 
          background: rgba(255, 255, 255, 0.03); 
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px; 
          backdrop-filter: blur(12px);
          margin: 8px 0;
        }
        
        .pipeline-stepper { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 16px; 
          border-bottom: 1px solid rgba(255, 255, 255, 0.06); 
          padding-bottom: 10px; 
        }
        
        .step { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          opacity: 0.25; 
          transition: all 0.4s ease;
          flex: 1;
        }
        
        .step.active { opacity: 0.6; }
        .step.current { opacity: 1; transform: scale(1.1); }
        .step.current .step-dot { background: var(--accent, #a78bfa); box-shadow: 0 0 8px var(--accent); }
        
        .step-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; margin-bottom: 5px; }
        .step-label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; }

        .lobes-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); 
          gap: 10px; 
        }
        .lobes-grid.mobile {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .lobo-card { 
          background: rgba(255, 255, 255, 0.02); 
          border: 1px solid rgba(255, 255, 255, 0.05); 
          border-radius: 14px; 
          padding: 12px 8px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          min-height: 80px;
        }
        
        .lobo-card:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.15); }
        .lobo-card:active { transform: scale(0.96); }
        
        .lobo-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .lobo-icon { font-size: 14px; }
        
        .status-indicator { width: 6px; height: 6px; border-radius: 50%; background: #444; }
        .status-indicator.thinking { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; animation: councilPulse 1.5s infinite; }
        .status-indicator.writing { background: #10b981; box-shadow: 0 0 8px #10b981; animation: councilPulse 1s infinite; }
        .status-indicator.done { background: #10b981; }
        .status-indicator.error { background: #ef4444; }

        .lobo-nome { font-size: 10px; font-weight: 700; color: var(--tx, #fff); }
        .lobo-preview { 
          font-size: 8px; 
          color: rgba(255, 255, 255, 0.4); 
          margin-top: 6px; 
          text-align: center; 
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mini-loader { margin-top: 8px; }

        @keyframes councilPulse { 0% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.3; transform: scale(0.8); } }

        .bottom-sheet-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(0, 0, 0, 0.7); 
          backdrop-filter: blur(4px);
          z-index: 2000; 
          display: flex; 
          align-items: flex-end;
          animation: fadeSheet 0.3s ease;
        }
        
        @keyframes fadeSheet { from { opacity: 0; } to { opacity: 1; } }

        .bottom-sheet { 
          width: 100%; 
          background: #0f0f1a; 
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-top-left-radius: 24px; 
          border-top-right-radius: 24px; 
          padding: 24px; 
          max-height: 85vh; 
          overflow-y: auto; 
          box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
          animation: slideSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .sheet-handle { width: 36px; height: 4px; background: rgba(255, 255, 255, 0.15); border-radius: 2px; margin: -8px auto 20px; }
        
        .sheet-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .lobo-icon-large { font-size: 24px; }
        .sheet-header h3 { margin: 0; font-size: 18px; flex: 1; }
        .close-sheet { background: rgba(255, 255, 255, 0.05); border: none; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }

        .full-argument { 
          font-size: 14px; 
          line-height: 1.6; 
          color: rgba(255, 255, 255, 0.85); 
          white-space: pre-wrap; 
        }
      `}</style>
    </div>
  );
}
