export async function falarTexto(texto, opcoes = {}) {
  if (!texto?.trim()) return

  try {
    // Tenta TTS via OpenRouter
    const resposta = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto: texto.slice(0, 4096), // limite de segurança
        voz: opcoes.voz || 'alloy'
      })
    })

    if (!resposta.ok) throw new Error('TTS falhou')

    const blob = await resposta.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)

    // Limpa URL após reprodução
    audio.onended = () => URL.revokeObjectURL(url)
    await audio.play()

    return audio

  } catch (erro) {
    // Fallback para Web Speech API nativa
    console.warn('[TTS] OpenRouter falhou, usando SpeechSynthesis:', erro)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(texto)
      utterance.lang = 'pt-PT'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }
}
