export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { audio, formato, idioma } = req.body

  const resposta = await fetch(
    'https://openrouter.ai/api/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/whisper-1',
        input_audio: {
          data: audio,
          format: formato || 'webm',
        },
        language: idioma || 'pt',
      }),
    }
  )

  const dados = await resposta.json()
  return res.status(resposta.status).json(dados)
}
