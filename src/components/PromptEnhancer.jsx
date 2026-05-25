import React from "react";

// PromptEnhancer.jsx — Presets para otimização rápida do input do utilizador.
export default function PromptEnhancer({ input, onApply, T, AC }) {
  if (!input || input.length <= 5) return null;

  const presets = [
    {
      id: "tecnico",
      label: "🛠️ Técnico",
      color: AC?.gemini || "#10b981",
      description: "Foca na arquitetura, boas práticas e código limpo.",
      enhance: (txt) => {
        const clean = txt.replace(/\s*\[(Análise Técnica|Modo Conciso|Modo Forense|Modo Criativo):.*?\]/g, "").trim();
        return `${clean}\n\n[Análise Técnica: Foca na arquitetura, padrões de desenho, performance, segurança e boas práticas. Fornece código limpo e explica as decisões técnicas.]`;
      }
    },
    {
      id: "curto",
      label: "⚡ Curto",
      color: AC?.claude || "#a78bfa",
      description: "Respostas concisas, diretas e sem rodeios.",
      enhance: (txt) => {
        const clean = txt.replace(/\s*\[(Análise Técnica|Modo Conciso|Modo Forense|Modo Criativo):.*?\]/g, "").trim();
        return `${clean}\n\n[Modo Conciso: Sê extremamente curto e direto ao assunto. Foca apenas na resposta essencial, sem rodeios ou saudações.]`;
      }
    },
    {
      id: "forense",
      label: "🕵️ Forense",
      color: AC?.perp || "#3b82f6",
      description: "Análise profunda de erros, segurança e causa-raiz.",
      enhance: (txt) => {
        const clean = txt.replace(/\s*\[(Análise Técnica|Modo Conciso|Modo Forense|Modo Criativo):.*?\]/g, "").trim();
        return `${clean}\n\n[Modo Forense: Realiza um diagnóstico detalhado, analisando possíveis erros, segurança, fluxo de dados e análise de causa-raiz. Lista potenciais falhas.]`;
      }
    },
    {
      id: "criativo",
      label: "🎨 Criativo",
      color: AC?.genspark || "#ec4899",
      description: "Explora perspetivas alternativas e soluções inovadoras.",
      enhance: (txt) => {
        const clean = txt.replace(/\s*\[(Análise Técnica|Modo Conciso|Modo Forense|Modo Criativo):.*?\]/g, "").trim();
        return `${clean}\n\n[Modo Criativo: Explora soluções inovadoras e abordagens alternativas. Pensa fora da caixa e sugere melhorias criativas de design ou experiência do utilizador.]`;
      }
    }
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "8px 12px",
        background: T?.s2 || "rgba(31, 31, 46, 0.65)",
        border: `1px solid ${T?.b1 || "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 12,
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        marginBottom: 8,
        animation: "fadeIn 0.18s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T?.ts || "#a8a8b8", textTransform: "uppercase", letterSpacing: 0.8 }}>
          Melhorar Pergunta
        </span>
        <span style={{ fontSize: 9, color: T?.tf || "#6b7280" }}>
          Adiciona diretrizes específicas à pergunta
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
          scrollbarWidth: "none", // ocultar scroll no Firefox
          msOverflowStyle: "none", // ocultar scroll no IE
        }}
      >
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.description}
            onClick={() => onApply(preset.enhance(input))}
            style={{
              flex: "0 0 auto",
              background: "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${T?.b1 || "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              padding: "6px 14px",
              color: T?.tx || "#f5f5ff",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
              minHeight: 44, // 44px mobile touch target
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = preset.color;
              e.currentTarget.style.background = `${preset.color}12`;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T?.b1 || "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
