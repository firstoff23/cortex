import { useCallback, useEffect, useRef, useState } from "react";
import { calcularConsensoMatematico, runJudges } from "../api/judges.js";
import { getJuizesParaPergunta } from "../utils/orchestrator.js";

function inserirResultadoProgressivo(lista, resultado) {
  const idx = lista.findIndex((item) => item.juiz === resultado.juiz);
  if (idx === -1) return [...lista, resultado];

  return lista.map((item, i) => (i === idx ? resultado : item));
}

function dedupeJuizes(lista) {
  const vistos = new Set();
  return lista.filter((resultado) => {
    if (!resultado?.juiz || vistos.has(resultado.juiz)) return false;
    vistos.add(resultado.juiz);
    return true;
  });
}

export default function useJudges() {
  const [juizesResultados, setJuizesResultados] = useState([]);
  const [juizesActivos, setJuizesActivos] = useState([]);
  const [consenso, setConsenso] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllersRef = useRef(new Map());

  const abort = useCallback(() => {
    controllersRef.current.forEach((ctrl) => ctrl.abort());
    controllersRef.current.clear();
    setLoading(false);
  }, []);

  useEffect(() => abort, [abort]);

  const reset = useCallback(() => {
    setJuizesResultados([]);
    setJuizesActivos([]);
    setConsenso(0);
    setError(null);
  }, []);

  const run = useCallback(async (pergunta, respostasLobos, options = {}) => {
    const idExecucao = `judges-${Date.now()}-${Math.random()}`;
    const ctrl = new AbortController();
    controllersRef.current.set(idExecucao, ctrl);

    const proximosJuizes = options.juizesActivos || getJuizesParaPergunta(pergunta);
    const proximoConsenso = calcularConsensoMatematico(respostasLobos);

    setLoading(true);
    setError(null);
    setJuizesResultados([]);
    setJuizesActivos(proximosJuizes);
    setConsenso(proximoConsenso);

    try {
      const resultados = await runJudges(
        pergunta,
        respostasLobos,
        proximosJuizes,
        ctrl.signal,
        (juiz) => setJuizesResultados((prev) => inserirResultadoProgressivo(prev, juiz)),
      );

      const resultadosUnicos = dedupeJuizes(resultados);
      setJuizesResultados(resultadosUnicos);
      return {
        consenso: proximoConsenso,
        juizesActivos: proximosJuizes,
        resultados: resultadosUnicos,
      };
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
      return {
        consenso: proximoConsenso,
        juizesActivos: proximosJuizes,
        resultados: [],
      };
    } finally {
      controllersRef.current.delete(idExecucao);
      setLoading(false);
    }
  }, []);

  return {
    run,
    abort,
    reset,
    juizesResultados,
    juizesActivos,
    consenso,
    loading,
    error,
  };
}
