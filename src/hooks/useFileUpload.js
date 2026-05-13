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

// Extrai texto de PDF via OpenRouter file-parser plugin (cloudflare-ai).
// Elimina a dependência local pdfjs-dist (~500kb bundle).
// As anotações da resposta são devolvidas para cache pelo chamador.
async function extrairPdfViaOpenRouter(file) {
  const buffer = await file.arrayBuffer();
  // btoa com chunks para evitar stack overflow em PDFs grandes
  const bytes = new Uint8Array(buffer);
  let binStr = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binStr += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const base64 = btoa(binStr);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  const resposta = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extrai todo o texto deste PDF. Devolve só o texto, sem comentários.',
            },
            {
              type: 'file',
              file: { filename: file.name, file_data: dataUrl },
            },
          ],
        },
      ],
      plugins: [{ id: 'file-parser', pdf: { engine: 'cloudflare-ai' } }],
      max_tokens: 4000,
    }),
  });

  const dados = await resposta.json();
  const texto = dados.choices?.[0]?.message?.content || '';
  const anotacoes = dados.choices?.[0]?.message?.annotations ?? null;
  return { texto, anotacoes };
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
  if (tipo === 'application/pdf' || ext === 'pdf') {
    const { texto, anotacoes } = await extrairPdfViaOpenRouter(file);
    return { conteudo: texto, anotacoes };
  }
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
  const [anotacoesPDF, setAnotacoesPDF] = useState({});
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
      // Guarda anotações do PDF para reutilização sem re-parsear
      if (extraido.anotacoes) {
        setAnotacoesPDF((prev) => ({ ...prev, [file.name]: extraido.anotacoes }));
      }
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
    anotacoesPDF,
    carregar: processar,
    limpar: handleRemove,
  };
}
