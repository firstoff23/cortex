import { useCallback, useState } from "react";

export function useStreaming() {
  const [textosParciais, setTextosParciais] = useState({});
  const [aStreaming, setAStreaming] = useState(false);

  const onToken = useCallback((delta, textoTotal, lobe) => {
    setTextosParciais((prev) => ({
      ...prev,
      [lobe.id]: textoTotal,
    }));
  }, []);

  const iniciar = useCallback(() => {
    setTextosParciais({});
    setAStreaming(true);
  }, []);

  const terminar = useCallback(() => {
    setAStreaming(false);
  }, []);

  return { textosParciais, aStreaming, onToken, iniciar, terminar };
}
