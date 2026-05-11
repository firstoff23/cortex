// src/i18n/en.js — English strings
export default {
  lang: "en",
  speechLang: "en-US",

  nav: {
    title: "CÓRTEX",
    subtitle: "11 Lobes · Council · Claude Opus 4.6",
    chat: "Chat",
    memory: "Mem.",
    keys: "Keys",
    settings: "Settings",
    history: "History",
    newChat: "+ New chat",
    models: "Models",
    guide: "Guide",
    theme: "Theme",
  },

  chat: {
    placeholder: "Ask the council...",
    send: "Send",
    regenerate: "Regenerate",
    export: "Export",
    voice: "Voice dictation",
    stop: "Stop",
    newChat: "New chat",
    copyAnswer: "Copy answer",
    share: "Share",
    viewCouncil: "View Council",
    hideCouncil: "Hide",
    scrollDown: "↓ new message",
    bufferHint: (cur, max) => `Buffer: ${cur}/${max} — reflection in ${max - cur} exchanges`,
    complexity: {
      SIMPLE: "⚡ Simple",
      MEDIUM: "⚙️ Medium",
      COMPLEX: "🧠 Complex",
    },
  },

  home: {
    title: "Digital Córtex",
    subtitle: "Council of",
    lobes: "11 lobes",
    judge: "Judge",
    configBrain: "🌱 Configure brain",
    suggestions: [
      "Explain vector memory in AI systems",
      "Best AI productivity tools in 2026?",
      "How to optimise an AI development workflow?",
      "Practical differences between major language models",
      "What is RAG and how does it work?",
      "How to build an AI agent with LangChain?",
      "Best practices for prompt engineering",
      "How does LLM fine-tuning work?",
      "Differences between embeddings and tokens",
      "What is the Transformer model and how did it emerge?",
    ],
  },

  phases: {
    council: (n) => `${n} lobes analysing...`,
    judges: "Dynamic judges evaluating...",
    rei: "King consolidating the verdict...",
    cortex: "Córtex fallback synthesis...",
    reflex: "Subconscious reflection...",
  },

  answer: {
    label: "Córtex",
    sub: "Final council synthesis",
    response: "Response",
    consensus: "Consensus",
    divergence: "Divergences",
    nextActions: "Next steps",
    confidence: "Confidence",
    councilDecision: "Council decision",
    memoryUsed: "Memory used",
    refinedQuery: "✦ Refined query:",
    regenerateLobe: "Regenerate lobe",
    copied: "✓ copied",
    copy: "⎘ copy",
  },

  memory: {
    title: "Memory",
    subtitle: "System accumulated knowledge",
    seed: "Seed",
    export: "Export",
    import: "Import",
    reset: "⟳",
    stats: {
      facts: "Facts",
      sessions: "Sessions",
      patterns: "Patterns",
      total: "Total",
    },
    sections: {
      semantic: { title: "Semantic", sub: "Facts and preferences" },
      episodic: { title: "Episodic", sub: "Summaries" },
      patterns: { title: "Patterns", sub: "Behaviours" },
    },
    empty: "Empty.",
    lastReflect: "Last reflection:",
    confirmReset: "Delete all memory?",
  },

  seed: {
    title: "Configure Brain",
    fields: [
      { label: "Who I am / personal context", ph: "E.g.: automation student, gaming, AI..." },
      { label: "Current context", ph: "E.g.: 2nd year, production line automation project..." },
      { label: "Main goals", ph: "E.g.: finish degree, internship, improve Python..." },
    ],
    save: "💾 Save memory seed",
    hint: "Sentences shorter than 20 chars are ignored.",
  },

  models: {
    title: "Active Models",
    hint: "Disable models you don't need. Disabled lobes are simulated by Claude.",
  },

  guide: {
    title: "User Guide",
    council: { title: "Council of 11 Lobes", body: "Every question is analysed in parallel by up to 11 models. Claude Opus 4.6 acts as judge and synthesises the best final answer." },
    cortex: { title: "Córtex", body: "Claude Opus 4.6 acts as council judge and synthesises the final answer based on active lobes." },
    memory: { title: "Memory", body: (max) => `Use "Seed" to give initial context. Every ${max} exchanges the system consolidates memories automatically.` },
    tip: "Shift+Enter = new line · 21 themes · Unlimited history · ↺ regenerate · ↓ export · 📤 share",
  },

  exportModal: { title: "Export Memory", hint: "Your brain as JSON:", copy: "📋 Copy" },
  importModal: { title: "Import Memory", placeholder: '{"episodic":[],"semantic":[],...}', submit: "✓ Import and replace" },

  keys: {
    title: "API Keys",
    hint: "Without a key the lobe is simulated via Groq.",
    active: "Active",
    simulated: "Simulated",
    test: "Test",
    testing: "Testing...",
    valid: "✓ Valid!",
    invalid: "✗ Invalid",
    save: "Save",
    saved: "✓ Saved",
    lock: "🔒 Lock",
    pin: {
      title: "Developer Area",
      sub: "Enter PIN to access API Keys",
      placeholder: "Access PIN...",
      enter: "Enter",
      wrong: "Wrong PIN",
      hint: "Default PIN: 3004. Change via localStorage(\"cortex-dev-pin\").",
    },
  },

  settings: {
    title: "Settings",
    theme: { label: "Theme", sub: (n) => `${n} themes`, action: "Change" },
    keys: { label: "API Keys", sub: (active, total) => `${active} of ${total} active`, action: "Manage keys" },
    arch: "Architecture v12",
  },

  toasts: {
    loadError: "Failed to load data — reset to defaults",
    regenerating: "Regenerating...",
    exportDone: "Conversation exported as .md",
    seedDone: "Brain configured successfully!",
    importDone: "Memory imported!",
    copied: "Copied!",
    shareCopied: "Answer copied for sharing",
    voiceUnsupported: "Voice not supported in this browser",
    voiceError: "Microphone error",
    reflectFail: "Subconscious reflection failed.",
    compressed: (b, a) => `⚡ Context compressed (${b}→${a} msgs)`,
  },

  fab: {
    close: "Close menu",
    open: "Open menu",
    title: "Quick navigation",
    items: {
      memory: "Mem.",
      models: "Models",
      theme: "Theme",
      guide: "Guide",
    },
  },

  sidebar: {
    title: "History",
    empty: "No saved conversations.\nStart writing!",
    conversations: "conversations",
    memNote: "Shared memory across conversations",
    msgs: (n) => `${n} msg`,
  },

  focus: {
    title: "Focus Mode",
  },
};
