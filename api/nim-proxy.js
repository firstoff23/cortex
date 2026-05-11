export default async function handler(req, res) {
  console.log('NIM Proxy chamado:', JSON.stringify(req.body));
  console.log('API Key presente:', !!process.env.NVIDIA_NIM_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.NVIDIA_NIM_KEY || process.env.VITE_NVIDIA_NIM_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NVIDIA_NIM_KEY não configurada' });
  }

  try {
    const resposta = await fetch(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(req.body),
      }
    );
    const dados = await resposta.json().catch(() => ({}));
    return res.status(resposta.status).json(dados);
  } catch (erro) {
    return res.status(500).json({ error: erro.message });
  }
}
