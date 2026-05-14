export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { pergunta, lobos, veredicto, notionToken, notionPageId } = req.body;

  if (!notionToken || !notionPageId) {
    return res.status(400).json({ error: "Token e ID da página são obrigatórios" });
  }

  // Constrói os blocos para o Notion
  const children = [
    {
      object: "block",
      type: "heading_1",
      heading_1: { rich_text: [{ type: "text", text: { content: "Córtex Digital — Relatório" } }] },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Pergunta: ", annotations: { bold: true } } },
          { type: "text", text: { content: pergunta || "" } },
        ],
      },
    },
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "Respostas dos Lobos" } }] },
    },
  ];

  // Adiciona respostas dos lobos
  if (Array.isArray(lobos)) {
    lobos.forEach((lobe) => {
      children.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: lobe.nome } }] },
      });
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: lobe.resposta || "[sem resposta]" } }],
        },
      });
    });
  }

  // Adiciona veredicto do Rei
  children.push({
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: "Veredicto do Rei" } }] },
  });
  children.push({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: veredicto || "[sem veredicto]" } }],
    },
  });

  try {
    const response = await fetch(`https://api.notion.com/v1/blocks/${notionPageId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ children }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Erro no Notion" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
