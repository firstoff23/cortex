import sanitize from "../middleware/sanitize.js";

const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export default async function handler(req, res) {
  // Segurança: Sanitize input
  let nextCalled = false;
  sanitize(req, res, () => {
    nextCalled = true;
  });
  if (!nextCalled) return;

  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const apiKey = process.env.NVIDIA_NIM_KEY || process.env.VITE_NVIDIA_NIM_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NVIDIA_NIM_KEY não configurada" });
  }

  try {
    const upstream = await fetch(NIM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const texto = await upstream.text().catch(() => "");
    let dados = {};
    try {
      dados = texto.trim() ? JSON.parse(texto) : {};
    } catch {
      dados = { error: "Resposta não-JSON do NIM" };
    }

    return res.status(upstream.status).json(dados);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
