// extractAudio.js — transcrição de áudio via Web Speech API (pt-PT)
/**
 * Inicia gravação de microfone e devolve transcrição como string.
 * Nota: funciona no browser, não em Node.js.
 * Para ficheiros MP3/WAV, a Web Speech API não faz replay de ficheiro —
 * a transcrição é sempre em tempo real via microfone.
 * @returns {Promise<string>} texto transcrito
 */
export function extrairAudio() {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      reject(new Error('Web Speech API não suportada neste browser'));
      return;
    }

    const sr = new SR();
    sr.lang = 'pt-PT';
    sr.interimResults = false;
    sr.maxAlternatives = 1;
    sr.continuous = false;

    sr.onresult = e => {
      const transcricao = e.results[0]?.[0]?.transcript || '';
      resolve(transcricao.trim());
    };

    sr.onerror = e => reject(new Error(`Erro no reconhecimento de voz: ${e.error}`));
    sr.onnomatch = () => reject(new Error('Nenhuma fala reconhecida'));

    sr.start();
  });
}
