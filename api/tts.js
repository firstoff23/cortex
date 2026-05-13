export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { texto, voz = 'alloy' } = req.body
  if (!texto) return res.status(400).json({ error: 'texto em falta' })

  const resposta = await fetch(
    'https://openrouter.ai/api/v1/audio/speech',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini-tts-2025-12-15',
        input: texto,
        voice: voz,
        response_format: 'mp3',
      }),
    }
  )

  if (!resposta.ok) {
    const err = await resposta.json().catch(() => ({}))
    return res.status(resposta.status).json({ error: err })
  }

  // Retorna áudio binário directamente
  const buffer = await resposta.arrayBuffer()
  res.setHeader('Content-Type', 'audio/mpeg')
  res.status(200).send(Buffer.from(buffer))
}
