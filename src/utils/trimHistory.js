/**
 * Limita o histórico enviado ao modelo às últimas N mensagens.
 * Preserva SEMPRE a primeira mensagem se for system prompt.
 *
 * @param {Array} messages - Array completo de mensagens
 * @param {number} maxMessages - Máximo de mensagens (default: 12)
 * @returns {Array} Array truncado
 */
export function trimHistory(messages, maxMessages = 12) {
  if (!messages || messages.length <= maxMessages) {
    return messages;
  }
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");
  const trimmed = conversationMessages.slice(-maxMessages);
  return [...systemMessages, ...trimmed];
}

export const HISTORY_LIMIT = 12;
