
// ═══════════════════════════════════════════════════════════
// PATCH: Router + Ollama — Córtex v11
// Cola este bloco ANTES do export default function Cortex
// ═══════════════════════════════════════════════════════════

// ── 1. CONFIGURAÇÃO OLLAMA ────────────────────────────────
const OLLAMA_URL = "http://localhost:3333/ollama"; // proxy Node que criámos
const OLLAMA_MODELS = {
  codigo:    "qwen2.5-coder:1.5b",  // trocar para :3b se tiveres instalado
  debug:     "qwen2.5-coder:1.5b",
  conversa:  "qwen2.5-coder:1.5b",
  fallback:  "qwen2.5-coder:1.5b",
};

// ── 2. FUNÇÃO callOllama ──────────────────────────────────
async function callOllama(sys, msg, modelKey = "codigo") {
  const model = OLLAMA_MODELS[modelKey] || OLLAMA_MODELS.codigo;
  const prompt = `${sys}

QUESTION: ${msg}

Answer in the same language as the question. Max 120 words.`;
  try {
    const r = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt })
    });
    if (!r.ok) {
      const e = await r.text().catch(() => "");
      throw new Error("Ollama " + r.status + ": " + e.slice(0, 80));
    }
    const d = await r.json();
    return (d.response || "").trim();
  } catch (e) {
    throw new Error("Ollama indisponível: " + e.message);
  }
}

// ── 3. ROUTER INTELIGENTE ─────────────────────────────────
// Analisa a pergunta e decide quais lobos chamar (nunca todos ao mesmo tempo)
function routerDecide(query) {
  const q = query.toLowerCase();

  // Palavras-chave por categoria
  const isCode    = /código|code|programar|script|bug|erro|implementar|function|class|react|js|python|jsx|html|css|refator/.test(q);
  const isDebug   = /debug|problema|falha|crash|erro|corrig|fix|broken|não funciona/.test(q);
  const isInfo    = /o que é|explica|porquê|diferença|como funciona|o que significa|define|historia/.test(q);
  const isCurrent = /hoje|atual|recente|2025|2026|notícia|mercado|preço|tendência/.test(q);
  const isPlan    = /plano|plan|etapas|passos|como fazer|estratégia|roadmap|arquitetura/.test(q);
  const isCreat   = /cria|gera|escreve|design|ideia|inventar|imagina|poema|história/.test(q);

  // Decisão — retorna array de lobe IDs para chamar
  if (isCode && isDebug)  return ["ollama_debug", "grok", "claude"];
  if (isCode)             return ["ollama_codigo", "genspark", "claude"];
  if (isDebug)            return ["ollama_debug", "gemini", "claude"];
  if (isCurrent)          return ["perp", "grok", "claude"];
  if (isPlan)             return ["gemini", "genspark", "manus", "claude"];
  if (isCreat)            return ["gemini", "genspark", "claude"];
  if (isInfo)             return ["grok", "gemini", "perp", "claude"];

  // Default: lobos base + claude juiz
  return ["grok", "gemini", "genspark", "claude"];
}

// ── 4. NOVOS LOBOS OLLAMA (adiciona ao array LOBES) ───────
// Cola estes dois lobos NO ARRAY LOBES existente:
//
//   { id: "ollama_codigo", label: "CÓDIGO",   sub: "Local",  color: "#22c55e", icon: "◌" },
//   { id: "ollama_debug",  label: "DEBUG",    sub: "Local",  color: "#84cc16", icon: "⬡" },
//
// ── 5. PROMPTS OLLAMA (adiciona ao objeto P) ─────────────
// Cola dentro do objeto P:
//
//   ollama_codigo: (m, q) => \`You are a LOCAL CODING assistant.\nMEMORY:\n\${m}\nQUESTION:\n"\${q}"\nMax 120 words. Same language.\`,
//   ollama_debug:  (m, q) => \`You are a LOCAL DEBUG specialist.\nMEMORY:\n\${m}\nQUESTION:\n"\${q}"\nBe precise, show cause and fix. Max 120 words. Same language.\`,
//
// ── 6. ATUALIZA invoke() ──────────────────────────────────
// Adiciona no início da função invoke(), ANTES do if (id==="grok"):
//
//   if (id === "ollama_codigo") {
//     try { return await callOllama(sys, msg, "codigo"); }
//     catch(e) { toast("Ollama Código: " + e.message); return "Ollama indisponível (fallback Claude)"; }
//   }
//   if (id === "ollama_debug") {
//     try { return await callOllama(sys, msg, "debug"); }
//     catch(e) { toast("Ollama Debug: " + e.message); return "Ollama indisponível (fallback Claude)"; }
//   }
//
// ── 7. ATUALIZA send() — usa o Router ─────────────────────
// Substitui a linha:
//   const [gRes, gmRes, pRes, gsRes] = await Promise.allSettled([...])
// por:
//
//   const lobesSelected = routerDecide(q);
//   const lobeResults = {};
//   await Promise.allSettled(
//     lobesSelected.filter(id => id !== "claude").map(async id => {
//       const lobe = LOBES.find(l => l.id === id);
//       if (!lobe) return;
//       const text = await invoke(id, P[id]?.(mem, q) || sys, q);
//       lobeResults[id] = text || \`\${lobe.label} indisponível\`;
//     })
//   );
//
//   // Monta contexto para o Claude juiz
//   const judgeContext = Object.entries(lobeResults)
//     .map(([k, v]) => \`[\${k.toUpperCase()}]\n\${v}\`)
//     .join("\n\n");
//
//   // Claude como juiz
//   const judgePrompt = \`You are the PREFRONTAL CORTEX — Executive Judge.\nMEMORY:\n\${mem}\nUSER:\n\${q}\n\n\${judgeContext}\n\nSYNTHESIZE: Judge which lobe was most useful, resolve contradictions, fuse into ONE superior answer. End with SÍNTESE: key insight. Same language.\`;
//   cR = await callClaude("Executive judge.", judgePrompt, 1200);
//
// ═══════════════════════════════════════════════════════════
// FIM DO PATCH
// ═══════════════════════════════════════════════════════════
