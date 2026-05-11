import { useRef, useCallback, useEffect } from 'react';

export function useAutoResize({ minHeight = 52, maxHeight = 200 } = {}) {
  const ref = useRef(null);

  const ajustar = useCallback((reset = false) => {
    const el = ref.current;
    if (!el) return;
    if (reset) {
      el.style.height = `${minHeight}px`;
      return;
    }
    el.style.height = `${minHeight}px`;
    const novo = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight));
    el.style.height = `${novo}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    if (ref.current) ref.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, [ajustar]);

  return { ref, ajustar };
}
