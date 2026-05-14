import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MemoryBanner from "./MemoryBanner.jsx";

function encontrarBotoes(elemento, encontrados = []) {
  if (!React.isValidElement(elemento)) return encontrados;
  if (elemento.type === "button") encontrados.push(elemento);

  React.Children.forEach(elemento.props.children, (filho) => {
    encontrarBotoes(filho, encontrados);
  });

  return encontrados;
}

describe("MemoryBanner", () => {
  it("mostra texto PT-PT e os dois botões esperados", () => {
    const html = renderToStaticMarkup(
      <MemoryBanner onUsarContexto={() => {}} onIgnorar={() => {}} />
    );

    expect(html).toContain("Tens contexto de uma sessão anterior.");
    expect(html).toContain("Queres continuar de onde ficaste?");
    expect(html).toContain("Sim, usar contexto");
    expect(html).toContain("Não, começar do zero");
  });

  it("liga cada botão ao callback correcto", () => {
    let usar = 0;
    let ignorar = 0;
    const elemento = (
      <MemoryBanner
        onUsarContexto={() => { usar += 1; }}
        onIgnorar={() => { ignorar += 1; }}
      />
    );

    const botoes = encontrarBotoes(elemento.type(elemento.props));
    botoes[0].props.onClick();
    botoes[1].props.onClick();

    expect(usar).toBe(1);
    expect(ignorar).toBe(1);
  });
});
