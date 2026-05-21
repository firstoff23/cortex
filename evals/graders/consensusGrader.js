export function extractConsensusScore(outputClaude) {
  const match = String(outputClaude || "").match(/Score de Consenso[:\s]+(\d+)/i);
  if (!match) return null;

  const score = Number(match[1]);
  if (!Number.isFinite(score)) return null;

  return Math.max(0, Math.min(100, score));
}
