import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CouncilStatus from "./CouncilStatus.jsx";

describe("CouncilStatus", () => {
  it("mostra lobos activos, juiz, modo e estado", () => {
    const html = renderToStaticMarkup(
      <CouncilStatus
        lobosAtivos={5}
        juizAtual="Rei do Córtex"
        modoAtual="Normal"
        estadoSessao="Pronto"
      />
    );

    expect(html).toContain("5 lobos ativos");
    expect(html).toContain("Rei do Córtex");
    expect(html).toContain("Normal");
    expect(html).toContain("Pronto");
  });
});
