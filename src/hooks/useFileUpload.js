// useFileUpload.js — hook para upload e extracção de ficheiros
import { useState, useCallback } from 'react';
import { extrairPDF }   from '../utils/extractors/extractPDF.js';
import { extrairDOCX }  from '../utils/extractors/extractDOCX.js';
import { extrairSheet } from '../utils/extractors/extractSheet.js';
import { extrairTexto } from '../utils/extractors/extractText.js';

const LIMITE_BYTES = 10 * 1024 * 1024; // 10 MB
const ERRO_AUDIO = 'Transcrição de ficheiros áudio não suportada. Use o microfone 🎙 para voz em tempo real.';

// Mapeia extensão → função extractor
const EXTRACTORS = {
  pdf:  extrairPDF,
  docx: extrairDOCX,
  txt:  extrairTexto,
  md:   extrairTexto,
  csv:  extrairSheet,
  xlsx: extrairSheet,
};

/**
 * Hook para carregar e extrair conteúdo de ficheiros.
 * @returns {{ carregar, ficheiro, erro, limpar }}
 *   ficheiro: { nome, tipo, texto, tamanho } | null
 */
export function useFileUpload() {
  const [ficheiro, setFicheiro] = useState(null);
  const [erro, setErro]         = useState(null);

  const carregar = useCallback(async (file) => {
    setErro(null);
    setFicheiro(null);

    if (!file) return;

    // Validar tamanho
    if (file.size > LIMITE_BYTES) {
      setErro(`Ficheiro demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: 10 MB.`);
      return;
    }

    // Detectar extensão
    const ext = file.name.split('.').pop().toLowerCase();

    // A transcrição de voz é só em tempo real; ficheiros áudio não devem arrancar o microfone.
    if (ext === 'mp3' || ext === 'wav') {
      setErro(ERRO_AUDIO);
      return;
    }

    const extractor = EXTRACTORS[ext];

    if (!extractor) {
      setErro(`Tipo não suportado: .${ext}. Usa PDF, DOCX, TXT, MD, CSV, XLSX, MP3 ou WAV.`);
      return;
    }

    try {
      const texto = await extractor(file);
      setFicheiro({
        nome:    file.name,
        tipo:    ext,
        texto:   texto.trim(),
        tamanho: file.size,
      });
    } catch (e) {
      setErro(`Erro ao processar ficheiro: ${e.message}`);
    }
  }, []);

  const limpar = useCallback(() => {
    setFicheiro(null);
    setErro(null);
  }, []);

  return { carregar, ficheiro, erro, limpar };
}
