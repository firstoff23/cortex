import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import StyleSelector from "./StyleSelector.jsx";

function encontrarBotoes(elemento, encontrados = []) {
  if (!React.isValidElement(elemento)) return encontrados;
  const tipo = typeof elemento.type === "function" ? elemento.type(elemento.props) : elemento;
  if (!React.isValidElement(tipo)) return encontrados;
  if (tipo.type === "button") encontrados.push(tipo);

  React.Children.forEach(tipo.props.children, (filho) => {
    encontrarBotoes(filho, encontrados);
  });

  return encontrados;
}

describe("StyleSelector", () => {
  it("destaca o estilo activo", () => {
    const html = renderToStaticMarkup(
      <StyleSelector estiloAtivo="tecnico" onChange={() => {}} />
    );

    expect(html).toContain("Técnico");
    expect(html).toContain("aria-pressed=\"true\"");
    expect(html).toContain("Foco em código e sistemas");
  });

  it("chama onChange ao seleccionar outro estilo", () => {
    let selecionado = "";
    const elemento = (
      <StyleSelector estiloAtivo="normal" onChange={(id) => { selecionado = id; }} />
    );
    const botoes = encontrarBotoes(elemento);
    const botaoCritico = botoes.find((botao) => botao.props["data-style-id"] === "critico");

    botaoCritico.props.onClick();

    expect(selecionado).toBe("critico");
  });
});
