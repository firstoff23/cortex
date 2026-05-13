const fs = require('fs');
const glob = require('glob'); // may not be installed, we will use plain node to find files

const dict = {
  't.keys.active': '"Activa"',
  't.keys.simulated': '"Simulada"',
  't.keys.testing': '"A testar..."',
  't.keys.valid': '"Válida"',
  't.keys.invalid': '"Inválida"',
  't.keys.test': '"Testar"',
  't.keys.save': '"Guardar"',
  't.keys.saved': '"Guardado!"',
  't.toasts.loadError': '"Erro ao carregar ficheiro"',
  't.toasts.regenerating': '"A regenerar conselho..."',
  't.home.title': '"Bem-vindo ao Córtex"',
  't.toasts.exportDone': '"Relatório exportado"',
  't.toasts.seedDone': '"Memória guardada"',
  't.toasts.importDone': '"Memória importada"',
  't.phases.council': '"Conselho de Lobos"',
  't.phases.judges': '"Juízes"',
  't.phases.rei': '"Veredicto do Rei"',
  't.phases.cortex': '"Córtex"',
  't.phases.reflex': '"Reflexão"',
  't.guide.title': '"Guia"',
  't.guide.council.title': '"O Conselho"',
  't.guide.council.body': '"Discussão entre diferentes perspectivas de IA."',
  't.guide.cortex.title': '"O Córtex"',
  't.guide.cortex.body': '"Integração final do conhecimento."',
  't.guide.memory.title': '"Memória"',
  't.guide.memory.body': '"Retenção a longo prazo e RAG."',
  't.guide.tip': '"Dica: usa o microfone para falares com o sistema."',
  't.exportModal.title': '"Exportar Memória"',
  't.exportModal.hint': '"JSON do teu cérebro:"',
  't.toasts.copied': '"Copiado"',
  't.exportModal.copy': '"📋 Copiar"',
  't.importModal.title': '"Importar Memória"',
  't.importModal.placeholder': '\'{"episodic":[],"semantic":[],...}\'',
  't.importModal.submit': '"✓ Importar e substituir"',
  't.seed.title': '"Semente da Memória"',
  't.seed.fields': '"Campos"',
  't.seed.save': '"Guardar"',
  't.seed.hint': '"Define o conhecimento inicial."',
  't.nav.theme': '"Tema"',
  't.models.title': '"Modelos"',
  't.models.hint': '"Activa e desactiva lobos."',
  't.nav.title': '"Córtex"',
  't.nav.subtitle': '"Plataforma multi-agente"',
  't.nav.chat': '"Chat"',
  't.nav.keys': '"Chaves API"',
  't.nav.memory': '"Memória"',
  't.nav.settings': '"Definições"',
  't.nav.models': '"Lobos"',
  't.nav.guide': '"Guia"',
  't.sidebar.title': '"Histórico"',
  't.sidebar.conversations': '"Conversas"',
  't.nav.newChat': '"Nova Conversa"',
  't.sidebar.empty.split': '["Sem histórico"]',
  't.sidebar.msgs': '"mensagens"',
  't.sidebar.memNote': '"Nota de memória"',
  't.fab.close': '"Fechar"',
  't.fab.title': '"Menu"',
  't.fab.items.memory': '"Memória"',
  't.fab.items.models': '"Modelos"',
  't.fab.items.theme': '"Tema"',
  't.fab.items.guide': '"Guia"',
  't.fab.open': '"Menu"',
  't.chat.scrollDown': '"Descer"',
  't.home.subtitle': '"O que vamos explorar hoje?"',
  't.home.lobes': '"Lobos oficiais"',
  't.home.judge': '"Veredicto"',
  't.home.suggestions': '"Sugestões rápidas"',
  't.home.configBrain': '"Configurar o Cérebro"',
  't.chat.regenerate': '"Regerar Resposta"',
  't.chat.voice': '"Ditado por Voz"',
  't.chat.export': '"Exportar"',
  't.chat.newChat': '"Nova Conversa"',
  't.keys.pin.title': '"Modo de Desenvolvimento"',
  't.keys.pin.sub': '"Insira o PIN de acesso"',
  't.keys.pin.placeholder': '"PIN"',
  't.keys.pin.wrong': '"PIN inválido"',
  't.keys.pin.enter': '"Entrar"',
  't.keys.pin.hint': '"O PIN protege as chaves da API de acessos indevidos no browser."',
  't.keys.title': '"Gestor de Chaves API"',
  't.keys.lock': '"Bloquear"',
  't.keys.hint': '"As tuas chaves são encriptadas e guardadas apenas no teu localStorage."',
  't.memory.title': '"Banco de Memória"',
  't.memory.subtitle': '"Episódica, semântica e padrões de raciocínio."',
  't.memory.seed': '"Semente"',
  't.memory.export': '"Exportar"',
  't.memory.import': '"Importar"',
  't.memory.confirmReset': '"Apagar TODA a memória?"',
  't.memory.reset': '"Apagar"',
  't.memory.stats.facts': '"Factos"',
  't.memory.stats.sessions': '"Sessões"',
  't.memory.stats.patterns': '"Padrões"',
  't.memory.stats.total': '"Total"',
  't.memory.sections.semantic.title': '"Semântica"',
  't.memory.sections.semantic.sub': '"Conhecimento base"',
  't.memory.sections.episodic.title': '"Episódica"',
  't.memory.sections.episodic.sub': '"Histórico contínuo"',
  't.memory.sections.patterns.title': '"Padrões"',
  't.memory.sections.patterns.sub': '"Raciocínio dedutivo"',
  't.memory.empty': '"Memória vazia"',
  't.memory.lastReflect': '"Última reflexão:"',
  't.settings.title': '"Definições Globais"',
  't.settings.theme.label': '"Personalização"',
  't.settings.theme.action': '"Alterar Tema"',
  't.settings.keys.label': '"Chaves API"',
  't.settings.keys.action': '"Gerir"',
  't.settings.arch': '"Arquitectura"',
};

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + "/" + file;
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
        filesList.push(fullPath);
      }
    }
  }
  return filesList;
}

const targetFiles = getFiles('src/components');
targetFiles.push('src/cortex-digital.jsx');

targetFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Replace dictionary exact matches
  for (const [key, value] of Object.entries(dict)) {
    if (content.includes(key)) {
      // Because sometimes it is {t.keys.title}, replacing with {"Gestor"}
      // It's safer to just replace `t.keys.title` with `"Gestor"` and then `{ "Gestor" }` evaluates to "Gestor"
      // Wait, what if it's t.keys.title inside a template string `${t.keys.title}`? It will become `${"Gestor"}` which evaluates fine.
      // What if it's title={t.keys.title}? It becomes title={"Gestor"} which evaluates fine!
      content = content.split(key).join(value);
      changed = true;
    }
  }

  // Handle complex ones:
  // t.chat.bufferHint(buf.length, MAX_BUF)
  content = content.replace(/t\.chat\.bufferHint\(([^,]+),\s*([^)]+)\)/g, '`${$1} / ${$2} tokens`');
  
  // t.settings.theme.sub(Object.keys(THEMES).length)
  content = content.replace(/t\.settings\.theme\.sub\(([^)]+)\)/g, '`${$1} temas disponíveis`');

  // t.settings.keys.sub(A, B)
  content = content.replace(/t\.settings\.keys\.sub\(([^,]+),\s*([^)]+)\)/g, '`${$1} de ${$2} chaves configuradas`');
  
  // t.memory.stats.facts.toLowerCase() -> just use "'factos'"
  content = content.replace(/t\.memory\.stats\.facts\.toLowerCase\(\)/g, '"factos"');
  content = content.replace(/t\.memory\.stats\.sessions\.toLowerCase\(\)/g, '"sessões"');

  // Remove `const { t, ... } = useI18n()`
  content = content.replace(/const\s*{\s*t[^}]*}\s*=\s*useI18n\(\);\s*/g, '');
  content = content.replace(/import\s*{\s*useI18n\s*}\s*from\s*['"].*useI18n.*['"];\s*/g, '');

  if (content !== fs.readFileSync(file, 'utf-8')) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
