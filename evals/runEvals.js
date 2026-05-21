import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gradeRelevance } from "./graders/relevanceGrader.js";
import { extractConsensusScore } from "./graders/consensusGrader.js";
import { gradeHonesty } from "./graders/honestyGrader.js";
import { gradeCost } from "./graders/costGrader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOCK_MODE = process.argv.includes("--mock");
const COUNCIL_URL = process.env.EVAL_COUNCIL_URL || "http://localhost:5173/api/council";

function lerJson(caminho) {
  return JSON.parse(fs.readFileSync(caminho, "utf8"));
}

function mapaPorId(lista) {
  return Object.fromEntries(lista.map((item) => [item.id, item]));
}

function media(numeros) {
  const validos = numeros.filter((valor) => typeof valor === "number" && Number.isFinite(valor));
  if (validos.length === 0) return 0;
  return Math.round(validos.reduce((total, valor) => total + valor, 0) / validos.length);
}

function percentagem(parte, total) {
  if (!total) return "0%";
  return `${Math.round((parte / total) * 100)}%`;
}

function extrairTextoResposta(payload) {
  if (typeof payload === "string") return payload;

  return (
    payload?.answer ||
    payload?.veredicto ||
    payload?.final ||
    payload?.content ||
    payload?.result?.veredicto ||
    payload?.structured?.final ||
    payload?.king?.veredicto ||
    JSON.stringify(payload)
  );
}

function extrairCusto(payload) {
  return Number(payload?.cost_eur ?? payload?.cost ?? payload?.usage?.cost_eur ?? 0);
}

function respostaMock(pergunta, esperado) {
  const honestidade = esperado.requires_honesty
    ? "Não sei afirmar com certeza absoluta; a resposta depende do contexto e há score de incerteza."
    : "Resposta objectiva com base nos critérios fornecidos.";

  const consenso = esperado.mock_consensus || Math.max(esperado.min_consensus || 70, 80);
  const criterios = pergunta.keywords_expected.join(", ");

  return {
    texto: `${honestidade} Critérios cobertos: ${criterios}. Score de Consenso: ${consenso}%`,
    cost_eur: 0,
  };
}

async function chamarCouncil(pergunta) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const resposta = await fetch(COUNCIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: pergunta.question,
        query: pergunta.question,
        message: pergunta.question,
      }),
      signal: controller.signal,
    });

    if (!resposta.ok) {
      throw new Error(`Council HTTP ${resposta.status}`);
    }

    const contentType = resposta.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return resposta.json();
    return resposta.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function avaliarPergunta(pergunta, esperado) {
  const inicio = Date.now();
  let output;
  let custo = 0;
  let erro = null;

  try {
    if (MOCK_MODE) {
      output = respostaMock(pergunta, esperado);
    } else {
      output = await chamarCouncil(pergunta);
    }
    custo = extrairCusto(output);
  } catch (e) {
    erro = e.message;
    output = `Erro: ${e.message}`;
  }

  const resposta = MOCK_MODE ? output.texto : extrairTextoResposta(output);
  const latenciaMs = Date.now() - inicio;
  const relevance = gradeRelevance(resposta, pergunta.keywords_expected);
  const consensus = extractConsensusScore(resposta);
  const honesty = gradeHonesty(resposta);
  const cost = gradeCost(custo, esperado.max_cost_eur);
  const consensusPass = consensus !== null && consensus >= esperado.min_consensus;
  const honestyPass = esperado.requires_honesty ? honesty.honest : true;
  const latencyPass = latenciaMs <= esperado.max_latency_ms;
  const relevancePass = relevance >= pergunta.min_confidence;
  const pass = Boolean(relevancePass && consensusPass && honestyPass && cost.withinBudget && latencyPass && !erro);

  return {
    id: pergunta.id,
    category: pergunta.category,
    question: pergunta.question,
    scores: {
      relevance,
      consensus,
      latencyMs: latenciaMs,
      cost,
      honesty,
    },
    checks: {
      relevancePass,
      consensusPass,
      honestyPass,
      costPass: cost.withinBudget,
      latencyPass,
    },
    pass,
    error: erro,
  };
}

async function runEvals() {
  const questions = lerJson(path.join(__dirname, "dataset", "questions.json"));
  const expected = mapaPorId(lerJson(path.join(__dirname, "dataset", "expected.json")));
  const results = [];

  for (const pergunta of questions) {
    const esperado = expected[pergunta.id];
    if (!esperado) {
      throw new Error(`Critérios esperados em falta para ${pergunta.id}`);
    }

    results.push(await avaliarPergunta(pergunta, esperado));
  }

  const passed = results.filter((result) => result.pass).length;
  const honestyMatches = results.filter((result) => result.checks.honestyPass).length;
  const budgetMatches = results.filter((result) => result.checks.costPass).length;
  const report = {
    timestamp: new Date().toISOString(),
    mode: MOCK_MODE ? "mock" : "real",
    totalQuestions: results.length,
    passed,
    failed: results.length - passed,
    avgRelevance: media(results.map((result) => result.scores.relevance)),
    avgConsensus: media(results.map((result) => result.scores.consensus)),
    avgLatencyMs: media(results.map((result) => result.scores.latencyMs)),
    honestyRate: percentagem(honestyMatches, results.length),
    budgetCompliance: percentagem(budgetMatches, results.length),
    results,
  };

  const reportDir = path.join(__dirname, "report");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "evalReport.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Evals F4-07 (${report.mode}): ${passed}/${results.length} passaram.`);
  console.log(`Relatório: ${reportPath}`);

  if (!MOCK_MODE && report.failed > 0) {
    process.exitCode = 1;
  }
}

runEvals().catch((error) => {
  console.error(`Falha no runner de evals: ${error.message}`);
  process.exitCode = 1;
});
