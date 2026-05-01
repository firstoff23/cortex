// /src/lib/safeStorage.js
// Cifra as API keys com AES antes de guardar no localStorage.
// A salt é derivada do hostname para que keys exportadas não funcionem
// noutros domínios sem re-introdução manual.

import CryptoJS from "crypto-js";

const STORAGE_PREFIX = "cortex_enc_";

// Salt derivada do host — não é segredo, apenas impede reutilização cross-domain
function getDerivedSalt() {
  return "cortex_" + (typeof window !== "undefined" ? window.location.hostname : "local");
}

/**
 * Guarda uma API key cifrada.
 * @param {string} provider  ex: "grok", "gemini", "claude"
 * @param {string} value     a key em texto simples
 */
export function saveKey(provider, value) {
  if (!provider || value === undefined) return;
  try {
    if (!value || value.trim() === "") {
      localStorage.removeItem(STORAGE_PREFIX + provider);
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(value, getDerivedSalt()).toString();
    localStorage.setItem(STORAGE_PREFIX + provider, encrypted);
  } catch (e) {
    console.warn("[safeStorage] saveKey falhou:", e.message);
  }
}

/**
 * Lê e decifra uma API key.
 * @param {string} provider
 * @returns {string} a key em texto simples, ou "" se não existir / falhar
 */
export function loadKey(provider) {
  if (!provider) return "";
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + provider);
    if (!stored) return "";
    const bytes = CryptoJS.AES.decrypt(stored, getDerivedSalt());
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    return plain || "";
  } catch (e) {
    console.warn("[safeStorage] loadKey falhou:", e.message);
    return "";
  }
}

/**
 * Remove a key cifrada de um provider.
 * @param {string} provider
 */
export function clearKey(provider) {
  if (!provider) return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + provider);
  } catch (e) {
    console.warn("[safeStorage] clearKey falhou:", e.message);
  }
}

/**
 * Carrega todas as keys dos providers conhecidos de uma vez.
 * @param {string[]} providers  lista de IDs ex: ["grok","gemini","claude",...]
 * @returns {Record<string, string>}
 */
export function loadAllKeys(providers = []) {
  return Object.fromEntries(providers.map((p) => [p, loadKey(p)]));
}

/**
 * Guarda um objeto inteiro de keys { provider: value }.
 * @param {Record<string, string>} keysObj
 */
export function saveAllKeys(keysObj = {}) {
  for (const [provider, value] of Object.entries(keysObj)) {
    saveKey(provider, value);
  }
}

/**
 * Migra keys antigas (texto simples) para formato cifrado.
 * Chama uma vez no arranque — é seguro chamar múltiplas vezes.
 * @param {string[]} providers
 */
export function migrateRawKeys(providers = []) {
  const LEGACY_KEY = "cortex-keys-global";
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object") return;
    for (const provider of providers) {
      if (parsed[provider] && !localStorage.getItem(STORAGE_PREFIX + provider)) {
        saveKey(provider, parsed[provider]);
      }
    }
    // Remove legado após migração bem-sucedida
    localStorage.removeItem(LEGACY_KEY);
    console.info("[safeStorage] Migração de keys legado concluída.");
  } catch {
    // silencioso — o formato legado pode não existir
  }
}
