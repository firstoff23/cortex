export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { audio, formato, idioma } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY não configurada" });
  }

  try {
    // Converte base64 para Buffer e depois para Blob
    const audioBuffer = Buffer.from(audio, "base64");
    const blob = new Blob([audioBuffer], { type: `audio/${formato || "webm"}` });

    const formData = new FormData();
    formData.append("file", blob, `audio.${formato || "webm"}`);
    formData.append("model", "openai/whisper-1"); // Ou o modelo Whisper do OpenRouter
    if (idioma) formData.append("language", idioma);

    const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
