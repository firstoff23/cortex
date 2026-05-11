function normalizarScore(score, fallback = 0.5) {
  const n = Number(score);
  if (!Number.isFinite(n)) return fallback;
  const decimal = n > 1 ? n / 100 : n;
  return Math.max(0, Math.min(1, decimal));
}

function garantirSugestoes(suggestions) {
  const base = Array.isArray(suggestions) ? suggestions.filter(Boolean).map(String).slice(0, 3) : [];
  while (base.length < 3) {
    base.push(["Aprofunda isto", "Mostra exemplos", "Resume a decisão"][base.length]);
  }
  return base;
}

function extrairJson(texto) {
  if (!texto || typeof texto !== "string") return null;

  try {
    return JSON.parse(texto);
  } catch {
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  }
}

function textoDoLobe(lobe) {
  if (!lobe) return "";
  if (typeof lobe === "string") return lobe;
  return lobe.resultado || lobe.result || lobe.content || "";
}

function nomeDoLobe(lobe, idx) {
  return lobe?.label || lobe?.nome || lobe?.id || `Lobe ${idx + 1}`;
}

export function calcularConfiancaFinal(scoreConsenso, scoreJuizes, divergenciaEntreCamadas) {
  const base = (normalizarScore(scoreConsenso, 0) * 0.3 + normalizarScore(scoreJuizes) * 0.7) * 100;
  const penalizacao = divergenciaEntreCamadas > 0.3 ? 15 : 0;
  return Math.max(0, Math.min(100, Math.round(base - penalizacao)));
}

export function formatarContextoRei(pergunta, respostasLobos, veredictoJuizes, consensoMatematico) {
  // Compacta o input do Rei para reduzir custo sem perder os sinais essenciais.
  const resumoJuizes = (Array.isArray(veredictoJuizes) ? veredictoJuizes : [])
    .filter((j) => j.sucesso)
    .map((j) => {
      const r = j.resultado || {};
      const problemas = r.problemas?.length ? r.problemas.join("; ") : "Nenhum";
      return `${j.emoji} ${j.nome} | Score: ${(normalizarScore(r.score, 0) * 100).toFixed(
        0,
      )}% | Problemas: ${problemas} | Rec: ${r.recomendacao || "—"}`;
    })
    .join("\n");

  const lobosFormatados = Array.isArray(respostasLobos)
    ? respostasLobos
        .map((lobe, idx) => `[${nomeDoLobe(lobe, idx)}]: ${textoDoLobe(lobe).slice(0, 500)}`)
        .join("\n\n")
    : String(respostasLobos || "");

  return `PERGUNTA: ${pergunta}

CONSENSO MATEMÁTICO ENTRE LOBOS: ${(normalizarScore(consensoMatematico, 0) * 100).toFixed(0)}%

RESUMO DOS LOBOS:
${lobosFormatados}

RESUMO DOS JUÍZES:
${resumoJuizes || "Nenhum juiz correu com sucesso."}`;
}

export const SYSTEM_REI = `És o Rei do Córtex Digital. O teu veredicto é a palavra final.

Recebes as respostas de 5 lobos e os veredictos dos juízes especializados.

Processo obrigatório — raciocínio visível resumido:
1. Indica quais lobos têm mais suporte dos juízes
2. Identifica contradições críticas
3. Decide quais informações usar e justifica em frases curtas
4. Sintetiza a resposta final

Regras:
- Cita inline [Nome do Lobe] e [Nome do Juiz] quando usas as suas ideias
- Nunca ignores problema identificado por 2+ juízes
- Admite "não sei com confiança" quando consenso < 40%
- PT-PT natural, directo, sem jargão
- Termina SEMPRE com 3 sugestões de resposta rápida, tom conversacional
- Não reveles pensamento oculto bruto; mostra só um trilho auditável e resumido

Devolve APENAS JSON sem markdown:
{
  "raciocinio": ["passo 1", "passo 2", "passo 3"],
  "veredicto": "texto com citações [Lobe X] e [Juiz Y]",
  "confianca_lobos": 0,
  "confianca_juizes": 0,
  "confianca_final": 0,
  "admite_incerteza": false,
  "razao_incerteza": null,
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"]
}`;

function scoreMedioJuizes(veredictoJuizes) {
  const juizesSucesso = (Array.isArray(veredictoJuizes) ? veredictoJuizes : []).filter(
    (j) => j.sucesso && typeof j.resultado?.score === "number",
  );

  return juizesSucesso.length
    ? juizesSucesso.reduce((acc, j) => acc + normalizarScore(j.resultado.score, 0), 0) /
        juizesSucesso.length
    : 0.5;
}

function normalizarResultadoRei(parseado, consensoMatematico, scoreJuizesMedio) {
  const consenso = normalizarScore(consensoMatematico, 0);
  const juizes = normalizarScore(scoreJuizesMedio);
  const divergencia = Math.abs(consenso - juizes);
  const confiancaFinal = calcularConfiancaFinal(consenso, juizes, divergencia);

  return {
    raciocinio: Array.isArray(parseado?.raciocinio)
      ? parseado.raciocinio.filter(Boolean).map(String)
      : ["Síntese directa dos sinais disponíveis."],
    veredicto: String(parseado?.veredicto || "").trim(),
    confianca_lobos: Math.round(consenso * 100),
    confianca_juizes: Math.round(juizes * 100),
    confianca_final: confiancaFinal,
    admite_incerteza:
      confiancaFinal < 40 ? true : Boolean(parseado?.admite_incerteza),
    razao_incerteza:
      confiancaFinal < 40
        ? parseado?.razao_incerteza || "Confiança final abaixo de 40%."
        : parseado?.razao_incerteza || null,
    suggestions: garantirSugestoes(parseado?.suggestions),
  };
}

export async function runKing(
  pergunta,
  respostasLobos,
  veredictoJuizes,
  consensoMatematico,
  abortSignal,
) {
  try {
    const contexto = formatarContextoRei(
      pergunta,
      respostasLobos,
      veredictoJuizes,
      consensoMatematico,
    );
    const scoreJuizesMedio = scoreMedioJuizes(veredictoJuizes);

    const resposta = await fetch("/api/chat", {
      method: "POST",
      signal: abortSignal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro-exp-03-25:free",
        system: SYSTEM_REI,
        messages: [{ role: "user", content: contexto }],
        max_tokens: 1500,
      }),
    });

    const dados = await resposta.json();
    if (!resposta.ok || dados.error) throw new Error(dados.error || `HTTP ${resposta.status}`);

    const parseado = extrairJson(dados.content || "");
    if (!parseado) throw new Error("Rei não devolveu JSON válido");

    return normalizarResultadoRei(parseado, consensoMatematico, scoreJuizesMedio);
  } catch (err) {
    if (err.name === "AbortError") return null;

    // Modo degradado gracioso: a UX continua mesmo sem juízes/Rei.
    return {
      raciocinio: ["Juízes indisponíveis — síntese directa dos lobos."],
      veredicto:
        "Modo simplificado: painel de juízes indisponível. Resposta baseada directamente nos lobos.",
      confianca_lobos: Math.round(normalizarScore(consensoMatematico, 0) * 100),
      confianca_juizes: null,
      confianca_final: Math.round(normalizarScore(consensoMatematico, 0) * 60),
      admite_incerteza: true,
      razao_incerteza: `Erro no Rei: ${err.message}`,
      suggestions: ["Tenta reformular a pergunta", "Reporta o erro", "Continua sem juízes"],
      modo_degradado: true,
    };
  }
}
