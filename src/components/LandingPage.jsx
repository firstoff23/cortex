import React, { useEffect, useRef, useState } from "react";
import "../styles/landing.css";

// Lobos definidos localmente para evitar dependência circular com council.js
const LOBOS_LANDING = [
  { id: 1, nome: "Analista Crítico",    icone: "⚖️", cor: "#ef4444", desc: "Factos & Lógica" },
  { id: 2, nome: "Inovador Criativo",   icone: "💡", cor: "#22c55e", desc: "Ideias & Visão" },
  { id: 3, nome: "Pragmático Técnico",  icone: "🔧", cor: "#3b82f6", desc: "Código & Sistemas" },
  { id: 4, nome: "Generalista",         icone: "🌐", cor: "#eab308", desc: "Contexto & Síntese" },
  { id: 5, nome: "Advogado do Diabo",   icone: "🔥", cor: "#8b5cf6", desc: "Risco & Contra-args" },
];

const PASSOS = [
  { num: "01", titulo: "Pergunta",  desc: "Tu formulas. O conselho ouve." },
  { num: "02", titulo: "Debate",    desc: "5 especialistas analisam em paralelo e debatem entre si." },
  { num: "03", titulo: "Veredicto", desc: "O Rei sintetiza. Uma resposta. Definitiva." },
];

const CONTEXTOS = [
  { id: "conhecimento", icone: "◇", titulo: "Conhecimento", desc: "Memória do projeto" },
  { id: "instrucoes",   icone: "✦", titulo: "Instruções",   desc: "Como o Rei responde" },
  { id: "estilos",      icone: "◈", titulo: "Modo Atual",   desc: null }, // preenchido via prop
  { id: "competencias", icone: "⌁", titulo: "Especialistas", desc: null }, // preenchido via prop
  { id: "historico",    icone: "↺", titulo: "Histórico",    desc: "Sessões anteriores" },
];

export default function LandingPage({
  carregando = false,
  lobosAtivos = 0,
  juizAtual = "Rei do Córtex",
  modoAtual = "Normal",
  estadoSessao = "Pronto",
  onIniciar,
  onAbrirContexto,
}) {
  const [visivel, setVisivel] = useState(false);
  const secaoRef = useRef(null);

  // Fade-in suave ao montar — usa requestAnimationFrame para garantir transição CSS
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisivel(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const contextos = CONTEXTOS.map((c) => ({
    ...c,
    desc: c.id === "estilos"      ? modoAtual
        : c.id === "competencias" ? `${lobosAtivos} lobos ativos`
        : c.desc,
  }));

  return (
    <section
      ref={secaoRef}
      className={`lp${visivel ? " lp--visivel" : ""}`}
      aria-label="Entrada do Córtex Digital"
    >
      {/* Brilho de fundo animado */}
      <div className="lp__glow" aria-hidden="true" />

      <div className="lp__content">

        {/* ─── HERO ─── */}
        <div className="lp__hero lp__fade" style={{ "--lp-delay": "0ms" }}>
          <div className="lp__logo" aria-hidden="true">
            <span>CD</span>
            {!carregando && <div className="lp__logo-pulse" />}
          </div>

          <h1 className="lp__title">
            Decide com o{" "}
            <span className="lp__title-accent">Conselho de Lobos.</span>
          </h1>
          <p className="lp__subtitle">
            5 especialistas de IA debatem em tempo real para te dar a resposta definitiva.
          </p>

          {/* CTA Principal */}
          {carregando ? (
            <div className="lp__skeleton" aria-label="A preparar o conselho...">
              <span /><span /><span />
            </div>
          ) : (
            <div className="lp__actions">
              <button
                type="button"
                id="lp-cta-iniciar"
                className="lp__cta"
                onClick={onIniciar}
              >
                <span className="lp__cta-icon">🐺</span>
                Iniciar Conselho
              </button>
              <span className="lp__estado">{estadoSessao}</span>
            </div>
          )}
        </div>

        {/* ─── GRELHA DOS LOBOS ─── */}
        {!carregando && (
          <div
            className="lp__lobos lp__fade"
            aria-label="Especialistas do conselho"
            style={{ "--lp-delay": "80ms" }}
          >
            <p className="lp__section-label">O Conselho</p>
            <div className="lp__lobos-grid">
              {LOBOS_LANDING.map((lobo, i) => (
                <div
                  key={lobo.id}
                  className="lp__lobo-card"
                  style={{
                    "--lobo-cor": lobo.cor,
                    "--lp-card-delay": `${i * 50}ms`,
                  }}
                >
                  <span className="lp__lobo-icone" aria-hidden="true">{lobo.icone}</span>
                  <span className="lp__lobo-nome">{lobo.nome}</span>
                  <span className="lp__lobo-desc">{lobo.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── COMO FUNCIONA ─── */}
        {!carregando && (
          <div
            className="lp__como lp__fade"
            aria-label="Como funciona o conselho"
            style={{ "--lp-delay": "160ms" }}
          >
            <p className="lp__section-label">Como Funciona</p>
            <div className="lp__passos">
              {PASSOS.map((p, i) => (
                <div key={p.num} className="lp__passo">
                  <div className="lp__passo-num">{p.num}</div>
                  <div className="lp__passo-body">
                    <strong className="lp__passo-titulo">{p.titulo}</strong>
                    <span className="lp__passo-desc">{p.desc}</span>
                  </div>
                  {i < PASSOS.length - 1 && (
                    <div className="lp__passo-seta" aria-hidden="true">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CARDS DE CONTEXTO ─── */}
        {!carregando && onAbrirContexto && (
          <div
            className="lp__contexto-grid lp__fade"
            aria-label="Ações de contexto"
            style={{ "--lp-delay": "240ms" }}
          >
            {contextos.map((card) => (
              <button
                key={card.id}
                type="button"
                id={`lp-ctx-${card.id}`}
                className="lp__ctx-card"
                onClick={() => onAbrirContexto(card.id)}
              >
                <span className="lp__ctx-icone">{card.icone}</span>
                <span className="lp__ctx-body">
                  <strong className="lp__ctx-titulo">{card.titulo}</strong>
                  <span className="lp__ctx-desc">{card.desc}</span>
                </span>
                <span className="lp__ctx-arrow" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        )}

        {/* ─── STATUS DO REI ─── */}
        {!carregando && (
          <p
            className="lp__rei-status lp__fade"
            aria-live="polite"
            style={{ "--lp-delay": "320ms" }}
          >
            <span aria-hidden="true">👑</span> {juizAtual} pronto para sintetizar
          </p>
        )}

      </div>
    </section>
  );
}
