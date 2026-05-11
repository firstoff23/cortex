export function runGraders(resultadoRei = {}) {
  const tem_citacoes_inline = /\[[^\]]+?\]/.test(resultadoRei.veredicto || "");
  const tem_score_confianca = typeof resultadoRei.confianca_final === "number";
  const tem_sugestoes =
    Array.isArray(resultadoRei.suggestions) && resultadoRei.suggestions.length === 3;
  const tem_raciocinio =
    Array.isArray(resultadoRei.raciocinio) && resultadoRei.raciocinio.length > 0;
  const admite_incerteza_quando_deve =
    typeof resultadoRei.confianca_final === "number" && resultadoRei.confianca_final < 40
      ? resultadoRei.admite_incerteza === true
      : true;

  const passou_todos =
    tem_citacoes_inline &&
    tem_score_confianca &&
    tem_sugestoes &&
    tem_raciocinio &&
    admite_incerteza_quando_deve;

  return {
    tem_citacoes_inline,
    tem_score_confianca,
    tem_sugestoes,
    tem_raciocinio,
    admite_incerteza_quando_deve,
    passou_todos,
  };
}
