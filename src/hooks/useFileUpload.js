// useFileUpload.js — F4-02 Upload Universal
import { useCallback, useEffect, useRef, useState } from 'react';

const ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.pdf,.docx,.txt,.md,.csv,.xlsx,.mp3,.wav,image/*,audio/*';
const AUDIO_PLACEHOLDER = '[áudio: processamento pendente]';

function extensao(file) {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

function lerComoTexto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Falha ao ler ficheiro.'));
    reader.readAsText(file);
  });
}

async function lerComoArrayBuffer(file) {
  return await file.arrayBuffer();
}

async function extrairPdf(file) {
  const pdfjs = await import('pdfjs-dist');
  if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  }

  const pdf = await pdfjs.getDocument({ data: await lerComoArrayBuffer(file) }).promise;
  const partes = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    partes.push(content.items.map((item) => item.str || '').join(' '));
  }
  return partes.join('\n\n').trim();
}

async function extrairDocx(file) {
  const mammoth = await import('mammoth');
  const resultado = await mammoth.extractRawText({ arrayBuffer: await lerComoArrayBuffer(file) });
  return String(resultado.value || '').trim();
}

async function extrairSheet(file) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await lerComoArrayBuffer(file), { type: 'array' });
  return workbook.SheetNames.map((nome) => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[nome]);
    return `# ${nome}\n${csv}`;
  }).join('\n\n').trim();
}

async function extrairConteudo(file) {
  const ext = extensao(file);
  const tipo = file.type || '';

  if (tipo.startsWith('image/')) {
    return { conteudo: null, previewUrl: URL.createObjectURL(file) };
  }
  if (tipo === 'application/pdf' || ext === 'pdf') return { conteudo: await extrairPdf(file) };
  if (ext === 'docx') return { conteudo: await extrairDocx(file) };
  if (tipo === 'text/plain' || ext === 'txt' || ext === 'md') {
    return { conteudo: (await lerComoTexto(file)).trim() };
  }
  if (ext === 'csv' || ext === 'xlsx') return { conteudo: await extrairSheet(file) };
  if (tipo.startsWith('audio/') || ext === 'mp3' || ext === 'wav') {
    return { conteudo: AUDIO_PLACEHOLDER };
  }

  throw new Error(`Tipo não suportado: .${ext || tipo}. Usa imagens, PDF, DOCX, TXT, MD, CSV, XLSX, MP3 ou WAV.`);
}

export function useFileUpload({ onUpload } = {}) {
  const [ficheiro, setFicheiro] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const libertarPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const processar = useCallback(async (file) => {
    if (!file) return;
    setErro(null);
    libertarPreview();

    try {
      const extraido = await extrairConteudo(file);
      if (extraido.previewUrl) previewUrlRef.current = extraido.previewUrl;

      const novoFicheiro = {
        nome: file.name,
        tipo: file.type || extensao(file),
        tamanho: file.size,
        conteudo: extraido.conteudo ?? null,
        texto: extraido.conteudo ?? null,
        previewUrl: extraido.previewUrl || null,
      };

      setFicheiro(novoFicheiro);
      onUpload?.({
        nome: novoFicheiro.nome,
        tipo: novoFicheiro.tipo,
        tamanho: novoFicheiro.tamanho,
        conteudo: novoFicheiro.conteudo,
        previewUrl: novoFicheiro.previewUrl,
      });
    } catch (err) {
      setErro(err.message || 'Erro ao processar ficheiro.');
      setFicheiro(null);
    }
  }, [libertarPreview, onUpload]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((event) => {
    const file = event.target.files?.[0];
    processar(file);
    event.target.value = '';
  }, [processar]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    processar(event.dataTransfer?.files?.[0]);
  }, [processar]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    libertarPreview();
    setFicheiro(null);
    setErro(null);
  }, [libertarPreview]);

  useEffect(() => () => {
    libertarPreview();
  }, [libertarPreview]);

  return {
    ficheiro,
    erro,
    isDragging,
    inputRef,
    accept: ACCEPT,
    handleClick,
    handleChange,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleRemove,
    carregar: processar,
    limpar: handleRemove,
  };
}
