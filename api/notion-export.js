const NOTION_VERSION = '2022-06-28';
const MAX_RICH_TEXT = 1900;
const MAX_BLOCKS = 95;

function textoSeguro(valor, fallback = '') {
  const texto = String(valor ?? fallback).trim();
  return texto || fallback;
}

function dividirTexto(texto) {
  const limpo = textoSeguro(texto, '[sem resposta]');
  const partes = [];
  for (let i = 0; i < limpo.length; i += MAX_RICH_TEXT) {
    partes.push(limpo.slice(i, i + MAX_RICH_TEXT));
  }
  return partes.length ? partes : ['[sem resposta]'];
}

function blocoTitulo(tipo, conteudo) {
  return {
    object: 'block',
    type: tipo,
    [tipo]: { rich_text: [{ text: { content: conteudo } }] },
  };
}

function blocoParagrafo(texto, prefixo = '') {
  return dividirTexto(texto).map((parte, idx) => {
    const richText = [];
    if (prefixo && idx === 0) {
      richText.push({ text: { content: prefixo }, annotations: { bold: true } });
    }
    richText.push({ text: { content: parte } });

    return {
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: richText },
    };
  });
}

function construirBlocos({ pergunta, lobos, veredicto }) {
  const blocos = [
    blocoTitulo('heading_2', '🔍 Pergunta'),
    ...blocoParagrafo(textoSeguro(pergunta, '[sem pergunta]')),
    blocoTitulo('heading_2', '🐺 Respostas dos Lobos'),
    ...((Array.isArray(lobos) ? lobos : []).flatMap((lobe) =>
      blocoParagrafo(
        textoSeguro(lobe.resposta || lobe.result, '[sem resposta]'),
        `${textoSeguro(lobe.nome || lobe.label, 'Lobe')}: `,
      )
    )),
    blocoTitulo('heading_2', '👑 Veredicto do Rei'),
    ...blocoParagrafo(textoSeguro(veredicto, '[sem veredicto]')),
  ];

  return blocos.slice(0, MAX_BLOCKS);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { pergunta, lobos, veredicto, notionToken, notionPageId } = req.body || {};
  if (!notionToken || !notionPageId) {
    return res.status(400).json({ error: 'Notion: token e page ID necessários' });
  }

  const resposta = await fetch(
    `https://api.notion.com/v1/blocks/${encodeURIComponent(notionPageId)}/children`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({ children: construirBlocos({ pergunta, lobos, veredicto }) }),
    },
  );

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) return res.status(resposta.status).json(dados);
  return res.status(200).json({ sucesso: true });
}
