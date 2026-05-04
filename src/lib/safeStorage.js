import CryptoJS from 'crypto-js';

// Chave derivada do origin — não é segredo, é ofuscação contra leitura direta no browser
const STORAGE_KEY = CryptoJS.SHA256(window.location.origin).toString().slice(0, 32);

function encrypt(value) {
  return CryptoJS.AES.encrypt(JSON.stringify(value), STORAGE_KEY).toString();
}

function decrypt(cipher) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, STORAGE_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

const safeStorage = {
  set(key, value) {
    try {
      localStorage.setItem(key, encrypt(value));
    } catch (err) {
      console.error('[safeStorage] set falhou:', err);
    }
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const result = decrypt(raw);
      return result !== null ? result : fallback;
    } catch {
      return fallback;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  }
};

export default safeStorage;
