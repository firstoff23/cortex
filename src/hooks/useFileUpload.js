import { useState } from "react";

// Importações lazy — só carregam se usadas
async function extractPDF(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(s => s.str).join(" ") + "\n";
  }
  return text.trim();
}

async function extractDOCX(file) {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

async function extractCSV(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = rej;
    reader.readAsText(file);
  });
}

async function extractTXT(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = rej;
    reader.readAsText(file);
  });
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  async function extractFile(file) {
    setUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let text = "";

      if (ext === "pdf")                      text = await extractPDF(file);
      else if (ext === "docx")                text = await extractDOCX(file);
      else if (ext === "csv" || ext === "txt" || ext === "md") text = await extractCSV(file);
      else throw new Error(`Formato .${ext} ainda não suportado`);

      // Trunca para não explodir o contexto (máx ~8000 chars)
      if (text.length > 8000) text = text.slice(0, 8000) + "\n\n[... truncado]";
      return text;

    } catch (e) {
      setUploadError(e.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { extractFile, uploading, uploadError };
}