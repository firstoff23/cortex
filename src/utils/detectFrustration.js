/**
 * Níveis de frustração detectados.
 * @typedef {"none" | "low" | "high"} FrustrationLevel
 */

/**
 * Detecta sinais de frustração do utilizador analisando o histórico de mensagens.
 * 
 * @param {Array<{role: string, content: string}>} messages Histórico de mensagens
 * @returns {FrustrationLevel} Nível de frustração ("none", "low", "high")
 */
export function detectFrustration(messages) {
  if (!messages || messages.length === 0) return "none";

  const userMessages = messages.filter(m => m.role === "user");
  if (userMessages.length === 0) return "none";

  const lastMsg = userMessages[userMessages.length - 1].content || "";
  let score = 0;

  // 1. Pontuação excessiva
  if (/\?{3,}|!{3,}|\.{4,}/.test(lastMsg)) {
    score += 1;
  }

  // 2. Keywords PT-PT de frustração
  const keywords = [
    "não funciona", "erro", "impossível", "desisti", "horrível",
    "não percebo", "que chatice", "não consigo", "já tentei tudo",
    "isto é uma treta", "ajuda", "socorro", "não sei mais", "nunca funciona"
  ];
  
  const lowerMsg = lastMsg.toLowerCase();
  for (const keyword of keywords) {
    if (lowerMsg.includes(keyword)) {
      score += 1;
      break; // Conta apenas 1 vez para a categoria de keywords
    }
  }

  // 3. Mensagem muito curta (< 10 chars) após mensagem longa (> 80 chars)
  if (userMessages.length >= 2) {
    const prevMsg = userMessages[userMessages.length - 2].content || "";
    if (prevMsg.length > 80 && lastMsg.length < 10) {
      score += 1;
    }
  }

  // 4. Regeneração ou repetição da mesma resposta/pergunta (verificar se a última msg é igual à anterior)
  if (userMessages.length >= 2) {
    const prevMsg = userMessages[userMessages.length - 2].content || "";
    if (prevMsg.trim() !== "" && prevMsg.trim() === lastMsg.trim()) {
      score += 1;
    }
  }

  if (score >= 2) return "high";
  if (score === 1) return "low";
  return "none";
}
