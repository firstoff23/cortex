// extractPDF.js — extrai texto de ficheiros PDF com pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// Worker necessário para pdfjs funcionar no browser
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extrai todo o texto de um ficheiro PDF.
 * @param {File} file — ficheiro PDF do input
 * @returns {Promise<string>} texto concatenado de todas as páginas
 */
export async function extrairPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const paginas = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const pagina = await pdf.getPage(i);
    const conteudo = await pagina.getTextContent();
    const texto = conteudo.items.map(item => item.str).join(' ');
    paginas.push(texto);
  }

  return paginas.join('\n\n');
}
