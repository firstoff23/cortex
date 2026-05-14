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
 * Limpa toda a memória guardada.
 */
export function clearMemory() {
  try {
    localStorage.removeItem(MEMORY_KEY);
  } catch {
    // localStorage indisponível — ignorar silenciosamente
  }
}
