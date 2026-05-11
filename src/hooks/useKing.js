import { useCallback, useEffect, useRef, useState } from "react";
import { runKing } from "../api/king.js";

export default function useKing() {
  const [resultadoRei, setResultadoRei] = useState(null);
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
    setResultadoRei(null);
    setError(null);
  }, []);

  const run = useCallback(async (pergunta, respostasLobos, veredictoJuizes, consenso) => {
    const idExecucao = `rei-${Date.now()}-${Math.random()}`;
    const ctrl = new AbortController();
    controllersRef.current.set(idExecucao, ctrl);

    setLoading(true);
    setError(null);

    try {
      const resultado = await runKing(
        pergunta,
        respostasLobos,
        veredictoJuizes,
        consenso,
        ctrl.signal,
      );

      setResultadoRei(resultado);
      return resultado;
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
      return null;
    } finally {
      controllersRef.current.delete(idExecucao);
      setLoading(false);
    }
  }, []);

  return {
    run,
    abort,
    reset,
    resultadoRei,
    loading,
    error,
  };
}
