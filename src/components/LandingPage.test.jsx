import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LandingPage from "./LandingPage.jsx";

function expandir(elemento) {
  if (!React.isValidElement(elemento)) return elemento;
  if (typeof elemento.type === "function") return expandir(elemento.type(elemento.props));
  return React.cloneElement(
    elemento,
    elemento.props,
    React.Children.map(elemento.props.children, expandir)
  );
}

function encontrarBotoes(elemento, encontrados = []) {
  if (!React.isValidElement(elemento)) return encontrados;
  if (elemento.type === "button") encontrados.push(elemento);
  React.Children.forEach(elemento.props.children, (filho) => encontrarBotoes(filho, encontrados));
  return encontrados;
}

function criarLanding(props = {}) {
  return (
    <LandingPage
      carregando={false}
      lobosAtivos={5}
      juizAtual="Rei do Córtex"
      modoAtual="Normal"
      estadoSessao="Pronto"
      onIniciar={() => {}}
      onAbrirContexto={() => {}}
      {...props}
    />
  );
}

describe("LandingPage", () => {
  it("mostra título, CTA e especialistas do conselho", () => {
    const html = renderToStaticMarkup(criarLanding());

    expect(html).toContain("Conselho de Lobos");
    expect(html).toContain("Iniciar Conselho");
    // Verifica que os lobos são mostrados
    expect(html).toContain("Analista Crítico");
    expect(html).toContain("Inovador Criativo");
    expect(html).toContain("Pragmático Técnico");
  });

  it("mostra os cards de contexto quando não está a carregar", () => {
    const html = renderToStaticMarkup(criarLanding());

    expect(html).toContain("Conhecimento");
    expect(html).toContain("Instruções");
    expect(html).toContain("Histórico");
    expect(html).toContain("Rei do Córtex");
  });

  it("mostra skeleton em estado de carregamento e oculta conteúdo", () => {
    const html = renderToStaticMarkup(criarLanding({ carregando: true }));

    // No loading state, não deve mostrar lobos nem steps
    expect(html).not.toContain("Analista Crítico");
    expect(html).not.toContain("Como Funciona");
  });

  it("liga o CTA ao callback onIniciar", () => {
    let iniciou = 0;
    const arvore = expandir(criarLanding({
      onIniciar: () => { iniciou += 1; },
    }));

    const botoes = encontrarBotoes(arvore);
    const cta = botoes.find((b) => b.props.id === "lp-cta-iniciar");
    expect(cta).toBeTruthy();
    cta.props.onClick();
    expect(iniciou).toBe(1);
  });

  it("liga os cards de contexto ao callback onAbrirContexto", () => {
    let painelAberto = "";
    const arvore = expandir(criarLanding({
      onAbrirContexto: (id) => { painelAberto = id; },
    }));

    const botoes = encontrarBotoes(arvore);
    const cardHistorico = botoes.find((b) => b.props.id === "lp-ctx-historico");
    expect(cardHistorico).toBeTruthy();
    cardHistorico.props.onClick();
    expect(painelAberto).toBe("historico");
  });
});
