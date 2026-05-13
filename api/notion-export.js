export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { pergunta, lobos, veredicto, notionToken, notionPageId } = req.body;

  // Constrói blocos Notion
  const blocos = [
    {
      object: 'block', type: 'heading_2',
      heading_2: { rich_text: [{ text: { content: '🔍 Pergunta' } }] }
    },
    {
      object: 'block', type: 'paragraph',
      paragraph: { rich_text: [{ text: { content: pergunta } }] }
    },
    {
      object: 'block', type: 'heading_2',
      heading_2: { rich_text: [{ text: { content: '🐺 Respostas dos Lobos' } }] }
    },
    ...lobos.map(lobe => ({
      object: 'block', type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: `${lobe.nome}: ` }, annotations: { bold: true } },
          { text: { content: lobe.resposta || '[sem resposta]' } }
        ]
      }
    })),
    {
      object: 'block', type: 'heading_2',
      heading_2: { rich_text: [{ text: { content: '👑 Veredicto do Rei' } }] }
    },
    {
      object: 'block', type: 'paragraph',
      paragraph: { rich_text: [{ text: { content: veredicto || '[sem veredicto]' } }] }
    },
  ];

  const resposta = await fetch(
    `https://api.notion.com/v1/blocks/${notionPageId}/children`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ children: blocos }),
    }
  );

  const dados = await resposta.json();
  if (!resposta.ok) return res.status(resposta.status).json(dados);
  return res.status(200).json({ sucesso: true });
}
