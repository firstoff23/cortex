// src/i18n/pt.js — strings em Português de Portugal
export default {
  lang: "pt",
  speechLang: "pt-PT",

  // Navegação
  nav: {
    title: "Córtex Digital",
    subtitle: "5 lobos oficiais · Council v12 · Rei/Codex",
    chat: "Chat",
    memory: "Memória",
    keys: "Chaves",
    settings: "Definições",
    history: "Histórico",
    newChat: "+ Nova conversa",
    models: "Modelos",
    guide: "Guia",
    theme: "Tema",
  },

  // Área de chat
  chat: {
    placeholder: "Pergunta ao conselho...",
    send: "Enviar",
    regenerate: "Regenerar",
    export: "Exportar",
    voice: "Ditado por voz",
    stop: "Parar",
    newChat: "Nova conversa",
    copyAnswer: "Copiar resposta",
    share: "Partilhar",
    viewCouncil: "Ver Conselho",
    hideCouncil: "Ocultar",
    scrollDown: "↓ nova mensagem",
    bufferHint: (cur, max) => `Buffer: ${cur}/${max} — reflexão em ${max - cur} trocas`,
    complexity: {
      SIMPLE: "⚡ Simples",
      MEDIUM: "⚙️ Médio",
      COMPLEX: "🧠 Complexo",
    },
  },

  // Boas-vindas / ecrã inicial
  home: {
    title: "Córtex Digital",
    subtitle: "Conselho de",
    lobes: "5 lobos",
    judge: "Juiz",
    configBrain: "🌱 Configurar cérebro",
    suggestions: [
      "Explica memória vetorial em sistemas de IA",
      "Melhores ferramentas de produtividade com IA em 2026?",
      "Como otimizar um workflow de desenvolvimento com IA?",
      "Diferenças práticas entre os principais modelos de linguagem",
      "O que é RAG e como funciona na prática?",
      "Como criar um agente de IA com LangChain?",
      "Melhores práticas para engenharia de prompts",
      "Como funciona o fine-tuning de modelos LLM?",
      "Diferenças entre embeddings e tokens",
      "O que é o modelo Transformer e como surgiu?",
    ],
  },

  // Fases de processamento
  phases: {
    council: (n) => `${n} lobos a analisar...`,
    judges: "Juízes dinâmicos a avaliar...",
    rei: "Rei a consolidar o veredicto...",
    cortex: "Síntese fallback do Córtex...",
    reflex: "Reflexão subconsciente...",
  },

  // Resposta do Córtex
  answer: {
    label: "Córtex",
    sub: "Síntese final do conselho",
    response: "Resposta",
    consensus: "Consenso",
    divergence: "Divergências",
    nextActions: "Próximos passos",
    confidence: "Confiança",
    councilDecision: "Decisão do conselho",
    memoryUsed: "Memória utilizada",
    refinedQuery: "✦ Pergunta refinada:",
    regenerateLobe: "Regenerar lobe",
    copied: "✓ copiado",
    copy: "⎘ copiar",
  },

  // Memória
  memory: {
    title: "Memória",
    subtitle: "Conhecimento acumulado do sistema",
    seed: "Seed",
    export: "Export",
    import: "Import",
    reset: "⟳",
    stats: {
      facts: "Factos",
      sessions: "Conversas",
      patterns: "Padrões",
      total: "Registos",
    },
    sections: {
      semantic: { title: "Semântica", sub: "Factos e preferências" },
      episodic: { title: "Episódica", sub: "Resumos" },
      patterns: { title: "Padrões", sub: "Comportamentos" },
    },
    empty: "Vazio.",
    lastReflect: "Última reflexão:",
    confirmReset: "Apagar toda a memória?",
  },

  // Seed modal
  seed: {
    title: "Configurar Cérebro",
    fields: [
      { label: "Quem sou eu / contexto pessoal", ph: "Ex: estudante de Automação na ESTCB, gaming, IA..." },
      { label: "Contexto atual", ph: "Ex: 2º ano, projeto de automação de linha de produção..." },
      { label: "Objetivos principais", ph: "Ex: terminar curso, estágio em automação, melhorar Python..." },
    ],
    save: "💾 Guardar seed de memória",
    hint: "Frases com menos de 20 chars são ignoradas. Regista em Episódica.",
  },

  // Modelos modal
  models: {
    title: "Modelos Activos",
    hint: "Desactiva modelos que não precisas. Os desactivados são simulados por Claude.",
  },

  // Guia modal
  guide: {
    title: "Guia de Utilização",
    council: { title: "Conselho de 5 Lobos", body: "Cada pergunta é analisada pelos lobos oficiais necessários. O Rei/Codex consolida a melhor resposta final." },
    cortex: { title: "Córtex", body: "O Rei/Codex atua como juiz do conselho e sintetiza a resposta final com base nos lobos ativos." },
    memory: { title: "Memória", body: (max) => `Usa "Seed" para dar contexto inicial. Cada resposta guarda um resumo episódico e, a cada ${max} trocas, o sistema consolida factos e padrões.` },
    tip: "Shift+Enter = nova linha · 21 temas · Histórico sem limite · ↺ regenerar · ↓ exportar · 📤 partilhar",
  },

  // Export / Import
  exportModal: { title: "Exportar Memória", hint: "JSON do teu cérebro:", copy: "📋 Copiar" },
  importModal: { title: "Importar Memória", placeholder: '{"episodic":[],"semantic":[],...}', submit: "✓ Importar e substituir" },

  // Keys
  keys: {
    title: "Chaves API",
    hint: "Sem key o lobe usa Groq para simular.",
    active: "Activo",
    simulated: "Simulado",
    test: "Testar",
    testing: "A testar...",
    valid: "✓ Válida!",
    invalid: "✗ Inválida",
    save: "Guardar",
    saved: "✓ Guardado",
    lock: "🔒 Bloquear",
    pin: {
      title: "Área de Desenvolvimento",
      sub: "Insere o PIN para aceder às API Keys",
      placeholder: "PIN de acesso...",
      enter: "Entrar",
      wrong: "PIN incorreto",
      hint: "PIN predefinido: 3004. Muda em localStorage(\"cortex-dev-pin\").",
    },
  },

  // Definições
  settings: {
    title: "Definições",
    theme: { label: "Tema", sub: (n) => `${n} temas`, action: "Mudar" },
    keys: { label: "Chaves API", sub: (active, total) => `${active} de ${total} activas`, action: "Gerir chaves" },
    arch: "Arquitectura v12",
  },

  // Toasts
  toasts: {
    loadError: "Falha ao carregar dados — reset para defaults",
    regenerating: "A regenerar...",
    exportDone: "Conversa exportada como .md",
    seedDone: "Cérebro configurado com sucesso!",
    importDone: "Memória importada!",
    copied: "Copiado!",
    shareCopied: "Resposta copiada para partilha",
    voiceUnsupported: "Voz não suportada neste browser",
    voiceError: "Erro no microfone",
    reflectFail: "Falha na reflexão subconsciente.",
    compressed: (b, a) => `⚡ Contexto comprimido (${b}→${a} msgs)`,
  },

  // FAB mobile
  fab: {
    close: "Fechar menu",
    open: "Abrir menu",
    title: "Navegação rápida",
    items: {
      memory: "Mem.",
      models: "Modelos",
      theme: "Tema",
      guide: "Guia",
    },
  },

  // Historial (sidebar)
  sidebar: {
    title: "Histórico",
    empty: "Sem conversas guardadas.\nComeça a escrever!",
    conversations: "conversas",
    memNote: "Memória partilhada entre conversas",
    msgs: (n) => `${n} msg`,
  },

  // Foco
  focus: {
    title: "Modo Foco",
  },
};
