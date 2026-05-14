/**
 * Chave usada no localStorage.
 * Prefixo "cortex_" para não colidir com outras chaves.
 */
const MEMORY_KEY = "cortex_session_memory";
const MAX_MEMORY_ENTRIES = 5;

/**
 * Gera um resumo simples da conversa para guardar.
 * Não usa LLM — extrai as primeiras e últimas mensagens.
 *
 * @param {Array} messages - Histórico completo da conversa
 * @param {string} conversationId - ID da conversa
 * @returns {Object} Entrada de memória
 */
export function buildMemoryEntry(messages, conversationId) {
  const lista = Array.isArray(messages) ? messages : [];
  const userMessages = lista.filter((m) => m.role === "user");
  const lastAssistant = [...lista].reverse().find((m) => m.role === "assistant");
  const agora = new Date();

  return {
    id: conversationId,
    data: agora.toLocaleDateString("pt-PT"),
    hora: agora.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    primeiraMensagem: userMessages[0]?.content?.slice(0, 100) || "",
    ultimaMensagem: userMessages[userMessages.length - 1]?.content?.slice(0, 100) || "",
    ultimaResposta: lastAssistant?.content?.slice(0, 150) || "",
    totalMensagens: lista.length,
  };
}

/**
 * Guarda entrada de memória no localStorage.
 * Mantém máximo MAX_MEMORY_ENTRIES entradas (FIFO).
 *
 * @param {Object} entry - Resultado de buildMemoryEntry()
 */
export function saveMemoryEntry(entry) {
  try {
    const existing = loadMemoryEntries();
    const updated = [entry, ...existing].slice(0, MAX_MEMORY_ENTRIES);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage indisponível — ignorar silenciosamente
  }
}

/**
 * Carrega todas as entradas de memória guardadas.
 * @returns {Array} Array de entradas (pode ser vazio)
 */
export function loadMemoryEntries() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Formata a entrada mais recente como contexto
 * para injectar no início de nova conversa.
 *
 * @returns {string|null} Texto de contexto ou null se vazio
 */
export function getLastSessionContext() {
  const entries = loadMemoryEntries();
  if (!entries.length) return null;

  const last = entries[0];
  return `Contexto da sessão anterior (${last.data} ${last.hora}): ` +
    `O utilizador perguntou sobre "${last.primeiraMensagem}" ` +
    `e terminou com "${last.ultimaMensagem}". ` +
    `Última resposta dada: "${last.ultimaResposta}".`;
}

/**
 * Decide se o banner de continuação deve aparecer.
 *
 * @param {Object} estado - Estado mínimo da UI
 * @returns {boolean} true se deve mostrar o banner
 */
export function shouldShowMemoryBanner({ page, dismissed, context, messages }) {
  const lista = Array.isArray(messages) ? messages : [];
  return page === "chat" &&
    dismissed !== true &&
    !!context &&
    !lista.some((m) => m.role === "user");
}

/**
 * Injecta contexto anterior como primeira mensagem de sistema.
 *
 * @param {Array} messages - Mensagens actuais da conversa
 * @param {string} context - Contexto formatado da sessão anterior
 * @param {Function} criarId - Gerador opcional de ID para testes
 * @returns {Array} Mensagens com contexto ou array original se já houver utilizador
 */
export function injectSessionContext(messages, context, criarId = () => Date.now() + Math.random()) {
  if (!context) return messages;
  const lista = Array.isArray(messages) ? messages : [];
  if (lista.some((m) => m.role === "user")) return messages;

  const mensagemSistema = {
    id: criarId(),
    role: "system",
    content: context,
    systemNote: true,
    memoryContext: true,
  };

  return [mensagemSistema, ...lista.filter((m) => !m.memoryContext)];
}

/**
 * Limpa toda a memória guardada.
 */
export function clearMemory() {
  try {
    localStorage.removeItem(MEMORY_KEY);
  } catch {
    // localStorage indisponível — ignorar silenciosamente
  }
}
