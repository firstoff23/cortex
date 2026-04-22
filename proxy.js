const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ── Ollama local ──────────────────────────────────────────
app.post("/ollama", async (req, res) => {
  try {
    const { model = "qwen2.5-coder:1.5b", prompt } = req.body;
    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.3, num_predict: 512 } })
    });
    const d = await r.json();
    res.json({ response: d.response || "", done: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Gemini proxy (usa GEMINI_API_KEY do servidor como fallback) ───
// O frontend chama /api/gemini/... quando não tem key própria
app.post("/gemini/*", async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: { message: "Gemini proxy sem key de servidor. Define GEMINI_API_KEY no .env" } });

  const path = req.params[0] || "v1beta/models/gemini-2.5-flash:generateContent";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/${path}?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req.body) }
    );
    const d = await r.json();
    res.status(r.status).json(d);
  } catch (e) {
    res.status(500).json({ error: { message: e.message } });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "Córtex Proxy OK",
    ollama: "localhost:11434",
    gemini: process.env.GEMINI_API_KEY ? "✓ key configurada" : "sem key (define GEMINI_API_KEY)"
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Córtex Proxy em http://localhost:${PORT}`));
