/**
 * Mapa de mensagens de erro classificadas em PT-PT.
 * Cada entrada tem: mensagem visível + acção sugerida.
 */
export const ERROR_MESSAGES = {
  MODEL_EMPTY_RESPONSE: {
    mensagem: "O modelo não devolveu uma resposta.",
    accao: "Tentar novamente",
  },
  QUOTA_EXCEEDED: {
    mensagem: "Limite de utilização atingido.",
    accao: "Escolher outro modelo",
  },
  NETWORK_ERROR: {
    mensagem: "Sem ligação ao servidor.",
    accao: "Verificar ligação e tentar novamente",
  },
  TIMEOUT: {
    mensagem: "A resposta demorou demasiado tempo.",
    accao: "Tentar novamente",
  },
  MODEL_UNAVAILABLE: {
    mensagem: "Este modelo está temporariamente indisponível.",
    accao: "Escolher outro modelo",
  },
  AUTH_ERROR: {
    mensagem: "Chave de API inválida ou expirada.",
    accao: "Verificar definições",
  },
  PARTIAL_RESPONSE: {
    mensagem: "A resposta foi interrompida.",
    accao: "Tentar novamente",
  },
  UNKNOWN: {
    mensagem: "Ocorreu um erro inesperado.",
    accao: "Tentar novamente",
  },
};

/**
 * Classifica um erro e retorna a mensagem correcta.
 * @param {Error|string} error
 * @returns {{ mensagem: string, accao: string }}
 */
export function classifyError(error) {
  const msg = String(error?.message || error || "").toLowerCase();

  if (msg.includes("quota") || msg.includes("429")) return ERROR_MESSAGES.QUOTA_EXCEEDED;
  if (msg.includes("timeout") || msg.includes("tempo esgotado") || msg.includes("408")) return ERROR_MESSAGES.TIMEOUT;
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("ligação")) return ERROR_MESSAGES.NETWORK_ERROR;
  if (msg.includes("401") || msg.includes("403") || msg.includes("api key") || msg.includes("chave")) return ERROR_MESSAGES.AUTH_ERROR;
  if (msg.includes("503") || msg.includes("unavailable") || msg.includes("indisponível")) return ERROR_MESSAGES.MODEL_UNAVAILABLE;
  if (msg.includes("empty") || msg.includes("no response") || msg.includes("resposta vazia")) return ERROR_MESSAGES.MODEL_EMPTY_RESPONSE;
  if (msg.includes("abort") || msg.includes("interrompida")) return ERROR_MESSAGES.PARTIAL_RESPONSE;
  return ERROR_MESSAGES.UNKNOWN;
}
