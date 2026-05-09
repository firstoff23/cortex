import { useEffect, useRef, useState } from "react";
import { callOpenRouter, OR_MODELS } from "../lib/openrouter.js";

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

export default function useCouncil(msgs, setMsgs) {
  const [phase, setPhase] = useState(null);
  const [lobeResults, setLobeResults] = useState([]);
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
    } = ctx;

    const q = (query || input).trim();
    if (!q || phase) return;

    const complexityLevel = classifyQuery(q);
    setInput("");
    const uMsg = { id: Date.now() + Math.random(), role: "user", content: q, complexity: complexityLevel };
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
        l.id !== "claude" &&
        modelsOn[l.id] !== false &&
        routedIds.includes(l.id) &&
        (!focusMode || focusLobes.has(l.id))
    ).slice(0, 5);

    if (!councilLobes.length && focusMode) {
      councilLobes = LOBES.filter(
        (l) => l.id !== "claude" && modelsOn[l.id] !== false && routedIds.includes(l.id)
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

    const results = await Promise.allSettled(
      councilLobes.map((l) =>
        invoke(l.id, P[l.id]?.(mem, qFinal) || `Answer: ${qFinal}`, qFinal, { toast, callOllama })
      )
    );
    const nextLobeResults = councilLobes.map((l, i) => {
      const r =
        results[i].status === "fulfilled"
          ? results[i].value
          : { result: `Tempo esgotado ou serviço indisponível`, model: "?", real: false };
      const isErr = !r.result || r.result.startsWith("[") || r.result.startsWith("Tempo");
      const confidence = lobeConfidenceScore(r.result, isErr);
      return {
        ...l,
        _key: l.id + i,
        result: r.result,
        srcModel: r.model,
        srcReal: r.real,
        isErr,
        latency: r.latency,
        confidence,
      };
    });
    setLobeResults(nextLobeResults);

    setPhase("cortex");
    let cR;
    let structured;
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

    let cDecision = heuristicDecision(q);
    try {
      cDecision = await callClaude(
        "Judge of an 11-lobe AI council.",
        P.judge(q, nextLobeResults),
        80,
        keys.claude,
        keys.perp
      );
    } catch {}

    const council = Object.fromEntries(nextLobeResults.map((l) => [l.id, l.result]));

    const aMsg = {
      id: Date.now() + Math.random(),
      role: "assistant",
      // Garante fallback quando o Córtex não devolve JSON estruturado.
      content: (structured?.final || cR || "").trim(),
      structured,
      council,
      lobeResults: nextLobeResults,
      usedMemory: usedMem,
      councilDecision: cDecision,
      refinedQuery: qFinal !== q ? qFinal : null,
    };

    const fm = [...nm, aMsg];
    setMsgs(fm);
    saveMsgs(fm);

    const buf2 = [...newBuf, `BRAIN: ${(structured?.final || cR || "").trim()}`];
    setBuf(buf2);
    let nb = { ...brain, sessions: brain.sessions + 1 };
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
    setTimeout(() => taRef.current?.focus(), 80);
  }

  return { send, invoke, lobeResults, phase, setPhase };
}
