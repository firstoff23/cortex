// useExport.js — exportação F4-03 sem aumentar o bundle inicial.

function valorTexto(valor, fallback = '') {
  const texto = String(valor ?? fallback).trim();
  return texto || fallback;
}

function normalizarLobe(lobe = {}) {
  return {
    nome: valorTexto(lobe.nome || lobe.label, 'Lobe'),
    resposta: valorTexto(lobe.resposta || lobe.result, '[sem resposta]'),
    modelo: valorTexto(lobe.modelo || lobe.srcModel || lobe.model, ''),
    confianca: lobe.confianca ?? lobe.confidence ?? null,
  };
}

function normalizarDados({ pergunta, lobos, veredicto } = {}) {
  return {
    pergunta: valorTexto(pergunta, '[sem pergunta]'),
    lobos: Array.isArray(lobos) ? lobos.map(normalizarLobe) : [],
    veredicto: valorTexto(veredicto, '[sem veredicto]'),
  };
}

function descarregarFicheiro(blob, nome, tipo) {
  const ficheiro = blob instanceof Blob ? new Blob([blob], { type: tipo }) : new Blob([blob], { type: tipo });
  const url = URL.createObjectURL(ficheiro);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportarWord(dadosExport) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const { pergunta, lobos, veredicto } = normalizarDados(dadosExport);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Córtex Digital — Relatório',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Pergunta: ', bold: true }),
              new TextRun(pergunta),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Respostas dos Lobos',
            heading: HeadingLevel.HEADING_2,
          }),
          ...lobos.map((lobe) => [
            new Paragraph({
              text: lobe.nome,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({ text: lobe.resposta || '[sem resposta]' }),
            new Paragraph({ text: '' }),
          ]).flat(),
          new Paragraph({
            text: 'Veredicto do Rei',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: veredicto || '[sem veredicto]' }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  descarregarFicheiro(
    blob,
    'cortex-relatorio.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );
}

export async function exportarExcel(dadosExport) {
  const XLSX = await import('xlsx');
  const { pergunta, lobos, veredicto } = normalizarDados(dadosExport);
  const dados = [
    ['Pergunta', pergunta],
    [''],
    ['Lobe', 'Resposta', 'Modelo', 'Confiança'],
    ...lobos.map((lobe) => [
      lobe.nome,
      lobe.resposta || '[sem resposta]',
      lobe.modelo || '',
      lobe.confianca != null ? `${lobe.confianca}%` : '',
    ]),
    [''],
    ['Veredicto do Rei', veredicto || '[sem veredicto]'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dados);
  ws['!cols'] = [{ wch: 20 }, { wch: 80 }, { wch: 30 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Córtex');
  XLSX.writeFile(wb, 'cortex-relatorio.xlsx');
}

export async function exportarNotion({ pergunta, lobos, veredicto, notionToken, notionPageId }) {
  if (!notionToken || !notionPageId) {
    throw new Error('Notion: token e page ID necessários');
  }

  const resposta = await fetch('/api/notion-export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...normalizarDados({ pergunta, lobos, veredicto }),
      notionToken,
      notionPageId,
    }),
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.error || dados.message || 'Notion export falhou');
  }
  return dados;
}

export default { exportarWord, exportarExcel, exportarNotion };
