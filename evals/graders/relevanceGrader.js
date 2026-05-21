export function gradeRelevance(resposta, keywordsExpected = []) {
  if (!Array.isArray(keywordsExpected) || keywordsExpected.length === 0) return 0;

  const texto = String(resposta || "").toLowerCase();
  const encontradas = keywordsExpected.filter((keyword) =>
    texto.includes(String(keyword).toLowerCase())
  );

  return Math.round((encontradas.length / keywordsExpected.length) * 100);
}
