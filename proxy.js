const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.post("/ollama", async (req, res) => {
  try {
    const { model = "qwen2.5-coder:1.5b", prompt } = req.body;

    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 512 }
      })
    });

    const d = await r.json();
    res.json({ response: d.response || "", done: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Córtex Proxy OK", ollama: "localhost:11434" });
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Córtex Proxy em http://localhost:${PORT}`);
});