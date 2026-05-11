// src/hooks/useI18n.js — sistema i18n sem dependências externas
import React, { useState, useCallback, createContext, useContext } from "react";
import pt from "../i18n/pt.js";
import en from "../i18n/en.js";

// Mapa de strings disponíveis
const LOCALES = { pt, en };

// Chave localStorage para persistência
const LS_KEY = "cortex-lang";

// Detecta idioma inicial: localStorage → browser → pt
function detectLang() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && LOCALES[saved]) return saved;
    const browser = (navigator.language || "pt").slice(0, 2).toLowerCase();
    return LOCALES[browser] ? browser : "pt";
  } catch {
    return "pt";
  }
}

// Hook principal
export function useI18n() {
  const [lang, setLangState] = useState(detectLang);

  // Persiste a escolha e atualiza estado
  const setLang = useCallback((next) => {
    if (!LOCALES[next]) return;
    try { localStorage.setItem(LS_KEY, next); } catch {}
    setLangState(next);
  }, []);

  // Alterna entre PT e EN
  const toggleLang = useCallback(() => {
    setLang(lang === "pt" ? "en" : "pt");
  }, [lang, setLang]);

  // Strings do idioma atual
  const t = LOCALES[lang];

  // Lang tag para Web Speech API (atualiza automaticamente)
  const speechLang = t.speechLang;

  return { t, lang, setLang, toggleLang, speechLang };
}

// Context opcional — só precisas se passares o hook a muitos nós
// Se não usares, ignora o bloco abaixo.
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const i18n = useI18n();
  return React.createElement(I18nContext.Provider, { value: i18n }, children);
}

// Hook de consumo quando usas o Provider
export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT: envolve a app em <I18nProvider>");
  return ctx;
}
