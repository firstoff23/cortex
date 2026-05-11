import { useEffect, useRef, useState } from "react";
import { callOpenRouter, OR_MODELS } from "../lib/openrouter.js";
import { calcularConsensoMatematico, runJudges } from "../api/judges.js";
import { runKing } from "../api/king.js";
import {
  runDebate as runDebateApi,
  runDebateStream as runDebateStreamApi,
} from "../api/council.js";
import { runGraders } from "../utils/graders.js";
import { getJuizesParaPergunta } from "../utils/orchestrator.js";

// Cache curta de respostas dos lobos para evitar chamadas repetidas.
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function cacheGet(id, q) {
  const k = id + "::" + q;
  const c = responseCache.get(k);
  if (c && Date.now() - c.t < CACHE_TTL) return c.v;
  return null;
}

function cacheSet(id, q, v) {
  responseCache.set(id + "::" + q, { v, t: Date.now() });
}

function upsertJudge(prev, next) {
  const idx = prev.findIndex((item) => item.juiz === next.juiz);
  if (idx === -1) return [...prev, next];
  return prev.map((item, i) => (i === idx ? next : item));
}

function dedupeJudges(judges) {
  const vistos = new Set();
  return judges.filter((judge) => {
    if (!judge?.juiz || vistos.has(judge.juiz)) return false;
    vistos.add(judge.juiz);
    return true;
  });
}

function fallbackDosLobos(lobes) {
  const validos = lobes.filter((l) => !l.isErr && l.result?.length > 10);
  const origem = validos.length ? validos : lobes;
  return origem.length
    ? origem.map((l) => `**${l.label}:** ${l.result}`).join("\n\n")
    : "Nenhum serviço respondeu. Verifica a ligação.";
}

function valorSettled(resultado, fallback = {}) {
  return resultado?.status === "fulfilled" ? resultado.value : fallback;
}

function erroSettled(resultado) {
  return resultado?.status === "rejected" ? resultado.reason?.message || "Serviço indisponível" : null;
}

function lobeDebateParaUI(lobe, index, ronda1, ronda2, lobeConfidenceScore) {
  const primeira = valorSettled(ronda1?.[index], {});
  const segunda = valorSettled(ronda2?.[index], primeira);
  const erro = erroSettled(ronda2?.[index]) || erroSettled(ronda1?.[index]);
  const result = erro ? `[Erro em ${lobe.nome}: ${erro}]` : segunda.resposta || primeira.resposta || "";
  const isErr = !!erro || !result || result.startsWith("[Erro");

  return {
    id: `debate-${lobe.id}`,
    streamId: lobe.id,
    label: lobe.nome,
    sub: lobe.provider,
    color: lobe.cor,
    icon: ["◉", "◈", "◐", "◑", "◒"][index] || "◌",
    _key: `debate-${lobe.id}-${index}`,
    result,
    ronda1: primeira.resposta || "",
    ronda2: segunda.resposta || "",
    srcModel: lobe.modelo,
    srcReal: !isErr,
    isErr,
    latency: segunda.latency || primeira.latency || null,
    confidence: lobeConfidenceScore(result, isErr),
  };
}

export async function runDebate(pergunta, modo = "paralelo", options = {}) {
  return runDebateApi(pergunta, modo, options);
}

export async function runDebateStream(pergunta, modo = "paralelo", options = {}) {
  return runDebateStreamApi(pergunta, modo, options);
}

export default function useCouncil(msgs, setMsgs) {
  const [phase, setPhase] = useState(null);
  const [lobeResults, setLobeResults] = useState([]);
  const [judgeResults, setJudgeResults] = useState([]);
  const [kingResult, setKingResult] = useState(null);
  const [gradersResult, setGradersResult] = useState(null);
  const [consensusScore, setConsensusScore] = useState(0);
  const [debateResult, setDebateResult] = useState(null);
  const controllersRef = useRef(new Map());

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((ctrl) => ctrl.abort());
      controllersRef.current.clear();
    };
  }, []);

  async function invoke(id, sys, msg, ctx = {}) {
    const { toast, callOllama } = ctx;
    const ctrl = new AbortController();
    controllersRef.current.set(id, ctrl);

    const ok = (text, real = true, latency = null) => ({
      result: text,
      model: OR_MODELS[id] || id,
      real,
      latency,
    });

    try {
      const cached = cacheGet(id, msg);
      if (cached) return { ...cached, fromCache: true };

      if (id === "ollama_codigo") {
        try {
          const t0 = Date.now();
          const r = ok(await callOllama(sys, msg, "codigo", ctrl.signal), true, Date.now() - t0);
          cacheSet(id, msg, r);
          return r;
        } catch (e) {
          return ok("Ollama Código indisponível: " + e.message, false);
        }
      }

      if (id === "ollama_debug") {
        try {
          const t0 = Date.now();
          const r = ok(await callOllama(sys, msg, "debug", ctrl.signal), true, Date.now() - t0);
          cacheSet(id, msg, r);
          return r;
        } catch (e) {
          return ok("Ollama Debug indisponível: " + e.message, false);
        }
      }

      const t0 = Date.now();
      const text = await callOpenRouter(id, sys, msg, 420, 30000, { signal: ctrl.signal });
      const r = ok(text, true, Date.now() - t0);
      cacheSet(id, msg, r);
      return r;
    } catch (e) {
      const errMsg = e.message || "";
      const isTimeout = /timeout/i.test(errMsg);
      if (isTimeout) toast?.(id + ": tempo esgotado", "error");
      else toast?.(id + ": " + errMsg.slice(0, 80));
      return { result: "[Erro em " + id + "]", model: id, real: false };
    } finally {
      if (controllersRef.current.get(id) === ctrl) controllersRef.current.delete(id);
    }
  }

  async function send(query, ctx = {}) {
    const {
      input,
      setInput,
      classifyQuery,
      saveMsgs,
      compressContext,
      buf,
      setBuf,
      keys,
      buildMem,
      brain,
      selectUsedMem,
      routerDecide,
      LOBES,
      modelsOn,
      temperaturas,
      focusMode,
      focusLobes,
      P,
      callClaude,
      hC,
      hP,
      normalizeCouncilPayload,
      heuristicDecision,
      saveBrain,
      setBrain,
      safeParseReflect,
      MAX_BUF,
      MAX_SEMANTIC,
      MAX_PATTERNS,
      MAX_EPISODIC,
      toast,
      autoSaveConv,
      currentConvId,
      taRef,
      lobeConfidenceScore,
      callOllama,
      modoDebate = "paralelo",
      runDebateStream = runDebateStreamApi,
      streaming,
      displayQuery,
      anexoUpload,
    } = ctx;

    const q = (query || input).trim();
    if (!q || phase) return;

    setJudgeResults([]);
    setKingResult(null);
    setGradersResult(null);
    setConsensusScore(0);
    setDebateResult(null);

    const complexityLevel = classifyQuery(q);
    setInput("");
    const uMsg = {
      id: Date.now() + Math.random(),
      role: "user",
      content: displayQuery || q,
      complexity: complexityLevel,
      anexo: anexoUpload || null,
    };
    const nm = [...msgs, uMsg];
    setMsgs(nm);
    saveMsgs(nm);

    const { buf: bufComprimido, compressed, before, after } = await compressContext(
      [...buf, `USER: ${q}`],
      keys.claude,
      keys.perp
    );
    const newBuf = bufComprimido;
    const mem = buildMem(brain);
    const usedMem = selectUsedMem(brain, q);
    const routedIds = routerDecide(q);

    let councilLobes = LOBES.filter(
      (l) =>
        modelsOn[l.id] !== false &&
        routedIds.includes(l.id) &&
        (!focusMode || focusLobes.has(l.id))
    ).slice(0, 5);

    if (!councilLobes.length && focusMode) {
      councilLobes = LOBES.filter(
        (l) => modelsOn[l.id] !== false && routedIds.includes(l.id)
      ).slice(0, 5);
    }

    let qFinal = q;
    setPhase("council");
    try {
      const refined = await callOpenRouter("gemini", P.refine(q), q, 120, 3500);
      if (
        refined &&
        refined.trim().length > 10 &&
        refined.trim().length < q.length * 3 &&
        !refined.includes("{") &&
        !refined.includes("```")
      )
        qFinal = refined.trim();
    } catch {
      // Falha silenciosa.
    }

    let debateResultado = null;
    let nextLobeResults = [];

    const modoExecucao = modoDebate === "debate" ? "debate" : "paralelo";
    streaming?.iniciar?.();
    try {
      debateResultado = await runDebateStream(qFinal, modoExecucao, {
        lobos: councilLobes,
        temperaturas,
        onToken: streaming?.onToken,
      });
    } finally {
      streaming?.terminar?.();
    }
    setDebateResult(modoExecucao === "debate" ? debateResultado : null);
    nextLobeResults = councilLobes.map((l, i) =>
      lobeDebateParaUI(l, i, debateResultado.ronda1, debateResultado.ronda2, lobeConfidenceScore)
    );
    setLobeResults(nextLobeResults);
    nextLobeResults
      .filter((l) => l.isErr)
      .slice(0, 2)
      .forEach((l) => toast?.(`Lobe ${l.label || l.id} falhou — a usar fallback`, "aviso"));

    const consenso = calcularConsensoMatematico(nextLobeResults);
    const juizesActivos = getJuizesParaPergunta(q);
    setConsensusScore(consenso);

    setPhase("judges");
    let veredictoJuizes = [];
    const ctrlJuizes = new AbortController();
    controllersRef.current.set("judges", ctrlJuizes);
    try {
      veredictoJuizes = await runJudges(
        q,
        nextLobeResults,
        juizesActivos,
        ctrlJuizes.signal,
        (juiz) => setJudgeResults((prev) => upsertJudge(prev, juiz))
      );
      veredictoJuizes = dedupeJudges(veredictoJuizes);
      setJudgeResults(veredictoJuizes);
    } catch (e) {
      toast(`Juízes: ${e.message}`);
    } finally {
      if (controllersRef.current.get("judges") === ctrlJuizes) controllersRef.current.delete("judges");
    }

    setPhase("rei");
    let resultadoRei = null;
    const ctrlRei = new AbortController();
    controllersRef.current.set("rei", ctrlRei);
    try {
      resultadoRei = await runKing(q, nextLobeResults, veredictoJuizes, consenso, ctrlRei.signal);
      setKingResult(resultadoRei);
    } catch (e) {
      toast(`Rei: ${e.message}`);
    } finally {
      if (controllersRef.current.get("rei") === ctrlRei) controllersRef.current.delete("rei");
    }

    const graders = runGraders(resultadoRei || {});
    setGradersResult(graders);

    let cR;
    let structured;
    if (resultadoRei) {
      cR = resultadoRei.veredicto || fallbackDosLobos(nextLobeResults);
      structured = {
        final: cR,
        consensus: veredictoJuizes.flatMap((j) => j.resultado?.validados || []).slice(0, 5),
        divergence: veredictoJuizes.flatMap((j) => j.resultado?.problemas || []).slice(0, 5),
        nextActions: resultadoRei.suggestions || [],
        confidence: `${resultadoRei.confianca_final}%`,
        king: resultadoRei,
      };
    } else {
      setPhase("cortex");
      try {
      const validLobes = nextLobeResults.filter((l) => !l.isErr && l.result?.length > 10);
      if (hC || hP)
        cR = await callClaude(
          "Executive judge of a multi-AI council brain.",
          P.cortex(mem, q, validLobes.length ? validLobes : nextLobeResults),
          5400,
          keys.claude,
          keys.perp
        );
      else {
        const validFb = nextLobeResults.filter((l) => !l.isErr && l.result?.length > 10);
        cR =
          validFb.length > 0
            ? validFb.map((l) => `**${l.label}:** ${l.result}`).join("\n\n")
            : "Nenhum serviço respondeu. Verifica a ligação.";
      }
    } catch (e) {
      cR = nextLobeResults.map((l) => `**${l.label}:** ${l.result}`).join("\n\n");
      toast(`Córtex: ${e.message}`);
    }

      structured = normalizeCouncilPayload(cR, typeof cR === "string" ? cR : "");
    }

    let cDecision = heuristicDecision(q);
    if (resultadoRei) {
      cDecision = `Rei: confiança final ${resultadoRei.confianca_final}%`;
    } else {
      try {
        cDecision = await callClaude(
          "Judge of an 11-lobe AI council.",
          P.judge(q, nextLobeResults),
          80,
          keys.claude,
          keys.perp
        );
      } catch {}
    }

    const council = Object.fromEntries(nextLobeResults.map((l) => [l.id, l.result]));

    const aMsg = {
      id: Date.now() + Math.random(),
      role: "assistant",
      // Garante fallback quando o Córtex não devolve JSON estruturado.
      content: (structured?.final || cR || "").trim(),
      structured,
      council,
      lobeResults: nextLobeResults,
      debate: debateResultado,
      modoDebate: modoDebate === "debate",
      judges: veredictoJuizes,
      king: resultadoRei,
      graders,
      consensoMatematico: consenso,
      usedMemory: usedMem,
      councilDecision: cDecision,
      refinedQuery: qFinal !== q ? qFinal : null,
    };

    const fm = [...nm, aMsg];
    setMsgs(fm);
    saveMsgs(fm);

    const buf2 = [...newBuf, `BRAIN: ${(structured?.final || cR || "").trim()}`];
    setBuf(buf2);
    const perguntaMemoria = q.replace(/\s+/g, " ").trim();
    const respostaMemoria = (structured?.final || cR || "").replace(/\s+/g, " ").trim();
    const resumoEpisodico = respostaMemoria
      ? `Pergunta: ${perguntaMemoria.slice(0, 180)} | Resposta: ${respostaMemoria.slice(0, 320)}`
      : "";
    let nb = {
      ...brain,
      sessions: brain.sessions + 1,
      episodic: resumoEpisodico
        ? [...brain.episodic, resumoEpisodico].slice(-MAX_EPISODIC)
        : brain.episodic,
    };
    let reflexOk = false;

    if (buf2.length >= MAX_BUF && nb.sessions >= 1) {
      setPhase("reflex");
      try {
        const raw = await callClaude(
          "Return only valid JSON.",
          P.reflect(buf2.join("\n"), buildMem(nb)),
          480,
          keys.claude,
          keys.perp
        );
        const ext = safeParseReflect(raw);
        nb = {
          ...nb,
          semantic: [...nb.semantic, ...(ext.new_semantic || [])].slice(-MAX_SEMANTIC),
          patterns: [...new Set([...nb.patterns, ...(ext.new_patterns || [])])].slice(-MAX_PATTERNS),
          episodic: ext.session_summary
            ? [...nb.episodic, ext.session_summary].slice(-MAX_EPISODIC)
            : nb.episodic,
          procedural: { ...nb.procedural, ...(ext.procedural_update || {}) },
          lastReflect: new Date().toISOString(),
        };
        reflexOk = !!(ext.new_semantic?.length || ext.new_patterns?.length || ext.session_summary);
      } catch {
        toast("Falha na reflexão subconsciente.");
      }
      setBuf([]);
    }

    setBrain(nb);
    saveBrain(nb);
    setPhase(null);

    if (compressed) {
      const note = {
        id: Date.now() + Math.random(),
        role: "assistant",
        content: `⚡ Contexto comprimido (${before}→${after} msgs)`,
        systemNote: true,
        compressNote: true,
      };
      setMsgs((prev) => {
        const u = [...prev, note];
        saveMsgs(u);
        return u;
      });
    }

    autoSaveConv(fm, currentConvId);
    if (resultadoRei) toast?.("Rei terminou o veredicto", "sucesso");
    setTimeout(() => taRef.current?.focus(), 80);
  }

  return {
    send,
    invoke,
    lobeResults,
    judgeResults,
    kingResult,
    gradersResult,
    consensusScore,
    debateResult,
    phase,
    setPhase,
  };
}
