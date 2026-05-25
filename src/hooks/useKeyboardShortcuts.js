import { useEffect, useRef } from "react";

// useKeyboardShortcuts.js — Atalhos de teclado globais protegendo elementos editáveis.
export default function useKeyboardShortcuts({
  onSubmit,
  onCancel,
  onForense,
  onClear,
  inputRef,
  isGenerating
}) {
  const handlersRef = useRef({ onSubmit, onCancel, onForense, onClear, inputRef, isGenerating });

  // Manter os handlers atualizados sem recriar o event listener
  useEffect(() => {
    handlersRef.current = { onSubmit, onCancel, onForense, onClear, inputRef, isGenerating };
  }, [onSubmit, onCancel, onForense, onClear, inputRef, isGenerating]);

  useEffect(() => {
    const isEditableElement = (el) => {
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        el.isContentEditable ||
        el.getAttribute("contenteditable") === "true"
      );
    };

    const handleKeyDown = (event) => {
      const {
        onSubmit: currentSubmit,
        onCancel: currentCancel,
        onForense: currentForense,
        onClear: currentClear,
        inputRef: currentInputRef,
        isGenerating: currentIsGenerating
      } = handlersRef.current;

      const target = event.target;

      // Ctrl + Enter → submete/envia pergunta
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        currentSubmit?.();
        return;
      }

      // Escape → cancela a geração (APENAS se estiver a gerar)
      if (event.key === "Escape") {
        if (currentIsGenerating) {
          event.preventDefault();
          currentCancel?.();
        }
        return;
      }

      // Ctrl + F → abre painel forense (diagnóstico)
      // Note: lowercase 'f' to catch standard keypress
      if (event.ctrlKey && (event.key === "f" || event.key === "F")) {
        event.preventDefault();
        currentForense?.();
        return;
      }

      // Ctrl + L → limpa a consola/memória (com confirmação externa)
      if (event.ctrlKey && (event.key === "l" || event.key === "L")) {
        event.preventDefault();
        currentClear?.();
        return;
      }

      // / → foca a caixa de texto se não estiver em campo editável
      if (event.key === "/" && !isEditableElement(target)) {
        event.preventDefault();
        currentInputRef?.current?.focus();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { passive: false });
    };
  }, []);
}
