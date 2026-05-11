// src/i18n/INTEGRATION.md — como ligar o i18n ao cortex-digital.jsx
// Comentários em PT-PT

/*
══════════════════════════════════════════════════════════════════
PASSO 1 — Adicionar o hook no topo do componente Cortex()
══════════════════════════════════════════════════════════════════

import { useI18n } from "./hooks/useI18n.js";

export default function Cortex() {
  const { t, lang, toggleLang, speechLang } = useI18n();
  // ... resto do estado


══════════════════════════════════════════════════════════════════
PASSO 2 — Botão de toggle PT/EN na navbar
══════════════════════════════════════════════════════════════════

Coloca dentro do <nav>, junto aos outros botões:

<button
  onClick={toggleLang}
  style={{
    ...navBtn(T),
    minWidth: 44,
    minHeight: 44,
    fontWeight: 700,
    color: T.tx,
  }}
  title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
>
  {lang === "pt" ? "EN" : "PT"}
</button>


══════════════════════════════════════════════════════════════════
PASSO 3 — Substituir strings hardcoded (exemplos diretos)
══════════════════════════════════════════════════════════════════

ANTES:  placeholder="Pergunta ao conselho..."
DEPOIS: placeholder={t.chat.placeholder}

ANTES:  "Córtex Digital"
DEPOIS: {t.home.title}

ANTES:  `${n} lobos a analisar...`
DEPOIS: {t.phases.council(n)}

ANTES:  "Memória"
DEPOIS: {t.memory.title}

ANTES:  "Apagar toda a memória?"
DEPOIS: confirm(t.memory.confirmReset)

ANTES:  toast("Copiado!", "success")
DEPOIS: toast(t.toasts.copied, "success")

ANTES:  `⚡ Contexto comprimido (${before}→${after} msgs)`
DEPOIS: t.toasts.compressed(before, after)

ANTES:  "A regenerar..."
DEPOIS: t.toasts.regenerating

ANTES:  "Voz não suportada neste browser"
DEPOIS: t.toasts.voiceUnsupported


══════════════════════════════════════════════════════════════════
PASSO 4 — Web Speech API com lang dinâmico
══════════════════════════════════════════════════════════════════

// Substitui a instanciação do SpeechRecognition:
const sr = new SR();
sr.lang = speechLang;   // "pt-PT" ou "en-US" automático
sr.interimResults = false;
sr.maxAlternatives = 1;


══════════════════════════════════════════════════════════════════
PASSO 5 — Prompts dos lobos adaptam idioma automaticamente
══════════════════════════════════════════════════════════════════

A função detectLang() já existente em cortex-digital.jsx
detecta o idioma da query para cada lobe. Com useI18n,
podes também forçar o idioma da instrução do sistema:

// Em vez de:
function detectLang(q) { ... }

// Passa o lang do hook para os prompts do sistema:
const sysLang = lang === "pt"
  ? "Responde sempre em Português de Portugal."
  : "Always respond in English.";

// E injeta nos prompts P:
P.grok  = (m, q) => `${sysLang} You are GROK... Memory:\n${m}\nQuestion: ${q}...`
// (repete para cada lobe conforme necessário)


══════════════════════════════════════════════════════════════════
SUGESTÕES DO HOME — usa t.home.suggestions em vez de ALL_SUGGESTIONS
══════════════════════════════════════════════════════════════════

// Substitui ALL_SUGGESTIONS pelo array do locale ativo:
function getRandomSuggestions(n = 4) {
  return shuffleArray(t.home.suggestions).slice(0, n);
}


══════════════════════════════════════════════════════════════════
ESTRUTURA FINAL DE FICHEIROS
══════════════════════════════════════════════════════════════════

src/
├── i18n/
│   ├── pt.js          ← strings PT-PT
│   └── en.js          ← strings EN
└── hooks/
    └── useI18n.js     ← hook { t, lang, setLang, toggleLang, speechLang }
*/
