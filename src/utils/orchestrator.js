const JUIZES_POR_TIPO = {
  codigo: ["tecnico", "relevancia", "historico"],
  factual: ["factual", "coerencia", "historico"],
  opiniao: ["relevancia", "coerencia"],
  criativo: ["relevancia"],
  default: ["factual", "relevancia", "coerencia"],
};

export function detectarTipoPergunta(pergunta = "") {
  const p = String(pergunta).toLowerCase();

  if (/c[oó]digo|python|javascript|jsx|react|fun[cç][aã]o|bug|erro|implementa|refactor/.test(p)) {
    return "codigo";
  }

  if (/verdade|facto|fato|quando|quem|onde|quantos|hist[oó]ria|actual|atual|recente/.test(p)) {
    return "factual";
  }

  if (/opini[aã]o|melhor|recomenda|achas|deves|preferes|vale a pena/.test(p)) {
    return "opiniao";
  }

  if (/escreve|cria|inventa|poema|hist[oó]ria|imagina|criativ/.test(p)) {
    return "criativo";
  }

  return "default";
}

export function getJuizesParaPergunta(pergunta = "") {
  const tipo = detectarTipoPergunta(pergunta);
  return [...(JUIZES_POR_TIPO[tipo] || JUIZES_POR_TIPO.default)];
}

export { JUIZES_POR_TIPO };
