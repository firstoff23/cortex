import React, { useState } from "react";
import { exportarWord, exportarExcel, exportarNotion } from "../hooks/useExport.js";

// ExportPanel.jsx — Painel para exportação de conversas e veredictos.
export default function ExportPanel({ msgs, T, AC, toast, onClose }) {
  const [notionToken, setNotionToken] = useState(() => {
    try { return localStorage.getItem("cortex_notion_token") || ""; } catch { return ""; }
  });
  const [notionPageId, setNotionPageId] = useState(() => {
    try { return localStorage.getItem("cortex_notion_page_id") || ""; } catch { return ""; }
  });
  const [mostrarNotion, setMostrarNotion] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [linkGerado, setLinkGerado] = useState("");

  // Helpers para extrair o último debate
  const obterPergunta = (messages, idx) => {
    return messages
      .slice(0, idx)
      .reverse()
      .find((x) => x.role === "user")?.content || "";
  };

  const obterTextoPrincipal = (m, king) => {
    return (king?.veredicto || m.structured?.final || m.content || "").trim();
  };

  const obterLobosExport = (m) => {
    return (m.lobeResults || []).map((lobe) => ({
      nome: lobe.nome || lobe.label,
      resposta: lobe.resposta || lobe.result,
      modelo: lobe.modelo || lobe.srcModel,
      confianca: lobe.confianca ?? lobe.confidence,
    }));
  };

  const lastAssistantMsgIdx = msgs.reduce((acc, m, i) => m.role === "assistant" ? i : acc, -1);
  const lastAssistantMsg = lastAssistantMsgIdx !== -1 ? msgs[lastAssistantMsgIdx] : null;

  const pergunta = lastAssistantMsg ? obterPergunta(msgs, lastAssistantMsgIdx) : "";
  const veredicto = lastAssistantMsg ? obterTextoPrincipal(lastAssistantMsg, lastAssistantMsg.king) : "";
  const lobos = lastAssistantMsg ? obterLobosExport(lastAssistantMsg) : [];

  const dadosExport = { pergunta, lobos, veredicto };

  const exportarMD = () => {
    if (msgs.length === 0) {
      toast?.("Sem mensagens para exportar", "info");
      return;
    }
    const lines = [`# Conversa Córtex Digital`, `> Gerado em ${new Date().toLocaleString("pt-PT")}`, ""];
    msgs.forEach((m) => {
      if (m.role === "user") {
        lines.push(`## 🧑 Utilizador`, m.content, "");
      } else if (m.systemNote || m._injected) {
        lines.push(`> ⚙️ ${m.content}`, "");
      } else {
        lines.push(`## 🧠 Córtex (Veredicto)`, m.content, "");
        if (m.councilDecision) {
          lines.push(`> Veredicto do Rei: ${m.councilDecision}`, "");
        }
      }
    });
    const mdContent = lines.join("\n");
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cortex-conversa-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.("Conversa exportada em Markdown", "sucesso");
  };

  const exportarJSON = () => {
    if (msgs.length === 0) {
      toast?.("Sem mensagens para exportar", "info");
      return;
    }
    const jsonContent = JSON.stringify(msgs, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cortex-conversa-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.("Conversa exportada em JSON", "sucesso");
  };

  const fazerExportNotion = async () => {
    if (!pergunta || !veredicto) {
      toast?.("Sem resposta de debate válida para exportar para o Notion", "erro");
      return;
    }
    if (!notionToken || !notionPageId) {
      toast?.("Preenche o Token e ID da página do Notion", "erro");
      return;
    }

    setExportando(true);
    try {
      localStorage.setItem("cortex_notion_token", notionToken);
      localStorage.setItem("cortex_notion_page_id", notionPageId);

      await exportarNotion({
        pergunta,
        lobos,
        veredicto,
        notionToken,
        notionPageId,
      });
      toast?.("Exportado para o Notion com sucesso!", "sucesso");
    } catch (e) {
      console.error("[Notion Export Error]", e);
      toast?.(`Erro ao exportar: ${e.message}`, "erro");
    } finally {
      setExportando(false);
    }
  };

  const criarLinkCurto = () => {
    if (!pergunta) {
      toast?.("Nenhum debate para partilhar", "info");
      return;
    }
    try {
      const payload = {
        p: pergunta.slice(0, 500), // Limitar tamanho da query
        v: veredicto.slice(0, 1500),
        t: Date.now()
      };
      // Usar codificação segura para URL
      const jsonStr = JSON.stringify(payload);
      const b64 = btoa(encodeURIComponent(jsonStr));
      const url = `${window.location.origin}?share=${b64}`;
      
      setLinkGerado(url);
      navigator.clipboard?.writeText(url).then(() => {
        toast?.("Link de partilha copiado para a área de transferência!", "sucesso");
      });
    } catch (e) {
      console.error(e);
      toast?.("Erro ao gerar link de partilha", "erro");
    }
  };

  const handleDocumentExport = async (tipo) => {
    if (!pergunta || !veredicto) {
      toast?.("Sem debate recente para exportar", "info");
      return;
    }
    setExportando(true);
    try {
      if (tipo === "word") {
        await exportarWord(dadosExport);
        toast?.("Relatório Word exportado", "sucesso");
      } else if (tipo === "excel") {
        await exportarExcel(dadosExport);
        toast?.("Relatório Excel exportado", "sucesso");
      }
    } catch (e) {
      console.error(e);
      toast?.(`Erro na exportação: ${e.message}`, "erro");
    } finally {
      setExportando(false);
    }
  };

  const accentColor = AC?.claude || "#a78bfa";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: T?.tx || "#f5f5ff",
        animation: "fadeIn 0.22s ease",
      }}
    >
      <div>
        <h4 style={{ fontSize: 12, color: accentColor, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 1.1, fontWeight: 700 }}>
          Conversa Completa
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button
            type="button"
            onClick={exportarMD}
            style={{
              background: T?.s2 || "#1f1f2e",
              border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
              borderRadius: 8,
              padding: "10px 12px",
              color: T?.tx || "#f5f5ff",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            📝 Markdown
          </button>
          <button
            type="button"
            onClick={exportarJSON}
            style={{
              background: T?.s2 || "#1f1f2e",
              border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
              borderRadius: 8,
              padding: "10px 12px",
              color: T?.tx || "#f5f5ff",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            📦 JSON
          </button>
        </div>
      </div>

      {pergunta && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, borderTop: `1px solid ${T?.b1 || "rgba(255,255,255,0.1)"}`, paddingTop: 14 }}>
          <h4 style={{ fontSize: 12, color: accentColor, margin: 0, textTransform: "uppercase", letterSpacing: 1.1, fontWeight: 700 }}>
            Último Debate/Veredicto
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              onClick={criarLinkCurto}
              style={{
                background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
                border: `1px solid ${accentColor}44`,
                borderRadius: 8,
                padding: "10px 14px",
                color: T?.tx || "#f5f5ff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                fontWeight: 700,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              🔗 Gerar Link de Partilha
            </button>

            {linkGerado && (
              <div
                style={{
                  background: T?.s2 || "#1f1f2e",
                  border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 10,
                  color: T?.ts || "#a8a8b8",
                  wordBreak: "break-all",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span>URL Partilhável:</span>
                <input
                  type="text"
                  readOnly
                  value={linkGerado}
                  onClick={(e) => e.target.select()}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.2)",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 6px",
                    color: T?.tx || "#f5f5ff",
                    fontFamily: "monospace",
                    fontSize: 10,
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleDocumentExport("word")}
              disabled={exportando}
              style={{
                background: T?.s2 || "#1f1f2e",
                border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: T?.tx || "#f5f5ff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                minHeight: 44,
                opacity: exportando ? 0.5 : 1,
              }}
            >
              📄 Relatório Word
            </button>
            <button
              type="button"
              onClick={() => handleDocumentExport("excel")}
              disabled={exportando}
              style={{
                background: T?.s2 || "#1f1f2e",
                border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: T?.tx || "#f5f5ff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                minHeight: 44,
                opacity: exportando ? 0.5 : 1,
              }}
            >
              📊 Relatório Excel
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              type="button"
              onClick={() => setMostrarNotion(!mostrarNotion)}
              style={{
                background: T?.s2 || "#1f1f2e",
                border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: T?.tx || "#f5f5ff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              📝 Notion Integration
            </button>

            {mostrarNotion && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${T?.b1 || "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  padding: 10,
                  marginTop: 4,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, color: T?.ts || "#a8a8b8" }}>Token de Integração</label>
                  <input
                    type="password"
                    placeholder="secret_xxxx"
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                    style={{
                      background: T?.s1 || "#14141e",
                      border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
                      borderRadius: 6,
                      padding: 8,
                      color: T?.tx || "#f5f5ff",
                      fontSize: 11,
                      fontFamily: "inherit",
                      outline: "none",
                      minHeight: 38,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 9, color: T?.ts || "#a8a8b8" }}>ID da Página Notion</label>
                  <input
                    type="text"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={notionPageId}
                    onChange={(e) => setNotionPageId(e.target.value)}
                    style={{
                      background: T?.s1 || "#14141e",
                      border: `1px solid ${T?.b1 || "rgba(255,255,255,0.12)"}`,
                      borderRadius: 6,
                      padding: 8,
                      color: T?.tx || "#f5f5ff",
                      fontSize: 11,
                      fontFamily: "inherit",
                      outline: "none",
                      minHeight: 38,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={fazerExportNotion}
                  disabled={exportando}
                  style={{
                    background: accentColor,
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 12px",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: "inherit",
                    minHeight: 38,
                    opacity: exportando ? 0.6 : 1,
                    marginTop: 4,
                  }}
                >
                  {exportando ? "A Exportar..." : "Enviar para Notion"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
