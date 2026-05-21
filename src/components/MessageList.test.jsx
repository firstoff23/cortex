import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MessageList from "./MessageList.jsx";

function CartaoTeste({ children }) {
  return <div>{children}</div>;
}

describe("MessageList", () => {
  it("permite wrap dos chips do Rei em mobile", () => {
    const html = renderToStaticMarkup(
      <MessageList
        msgs={[
          {
            id: "rei-wrap",
            role: "assistant",
            content: "Veredicto",
            king: {
              suggestions: [
                "Primeira sugestão rápida",
                "Segunda sugestão rápida",
                "Terceira sugestão rápida",
              ],
            },
          },
        ]}
        T={{}}
        AC={{ claude: "#a855f7" }}
        CopyBtn={() => null}
        Markdown={({ children }) => <>{children}</>}
        showCouncil={null}
        setShowCouncil={() => {}}
        isMobile
        setMsgs={() => {}}
        ClaudeCardComponent={CartaoTeste}
      />
    );

    expect(html).toContain("display:flex");
    expect(html).toContain("flex-wrap:wrap");
    expect(html).toContain("max-width:100%");
    expect(html).toContain("width:auto");
  });
});
