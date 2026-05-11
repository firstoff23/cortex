// extractText.js — extrai texto de ficheiros TXT e MD com FileReader nativo
/**
 * Lê um ficheiro de texto (TXT ou MD) como string UTF-8.
 * @param {File} file — ficheiro TXT ou MD
 * @returns {Promise<string>} conteúdo do ficheiro
 */
export function extrairTexto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Erro ao ler ficheiro de texto'));
    reader.readAsText(file, 'UTF-8');
  });
}
