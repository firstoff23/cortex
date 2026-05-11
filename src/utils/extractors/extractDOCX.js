// extractDOCX.js — extrai texto de ficheiros Word com mammoth
import mammoth from 'mammoth';

/**
 * Extrai texto limpo de um ficheiro .docx.
 * @param {File} file — ficheiro DOCX
 * @returns {Promise<string>} texto sem formatação HTML
 */
export async function extrairDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const resultado = await mammoth.extractRawText({ arrayBuffer });
  return resultado.value.trim();
}
