import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { existsSync, readFileSync } from "fs";
import sanitize from "./middleware/sanitize.js"; // ← .js obrigatório em ESM
import notionExportHandler from "./api/notion-export.js";

const PROD_ORIGIN = "https://cortex-five-hazel.vercel.app";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const FREE_FALLBACKS = [
  "google/gemma-3-4b-it:free",
  "google/gemma-3n-e4b-it:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

function carregarEnvLocal() {
  for (const ficheiro of [".env.local", ".env"]) {
    if (!existsSync(ficheiro)) continue;
    const linhas = readFileSync(ficheiro, "utf8").split(/\r?\n/);
    for (const linha of linhas) {
      const limpo = linha.trim();
      if (!limpo || limpo.startsWith("#") || !limpo.includes("=")) continue;
      const idx = limpo.indexOf("=");
      const chave = limpo.slice(0, idx).trim();
      const valor = limpo.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (chave && process.env[chave] === undefined) process.env[chave] = valor;
    }
  }
}

carregarEnvLocal();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ── Rate limiter + sanitize nas rotas de IA ──────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Demasiados pedidos. Tenta novamente em 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(["/api/chat", "/api/nim-proxy", "/ollama", "/gemini/{*path}"], aiLimiter, sanitize);

async function lerJsonSeguro(resposta) {
  const texto = await resposta.text().catch(() => "");
  if (!texto.trim()) return {};

  try {
    return JSON.parse(texto);
  } catch {
    return { error: `Resposta não-JSON HTTP ${resposta.status}` };
  }
}

function erroTexto(erro) {
  if (!erro) return "";
  if (typeof erro === "string") return erro;
  return erro.message || JSON.stringify(erro);
}

function lerOpenRouterKey() {
  return process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_KEY;
}

function lerNimKey() {
  return process.env.NVIDIA_NIM_KEY || process.env.VITE_NVIDIA_NIM_KEY;
}

// ── Proxy local compatível com /api/chat da Vercel ───────────
app.post("/api/chat", async (req, res) => {
  const { model, messages, system, max_tokens } = req.body || {};
  const apiKey = lerOpenRouterKey();

  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_KEY/OPENROUTER_API_KEY não configurada" });
  }

  if (typeof model !== "string" || !model.trim() || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Campos obrigatórios: model, messages" });
  }

  const payload = {
    max_tokens: max_tokens || 420,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
  };
  const modelos = model.endsWith(":free")
    ? [model, ...FREE_FALLBACKS.filter((m) => m !== model)]
    : [model];
  let ultimoErro = null;
  let ultimoStatus = 502;

  try {
    for (const modeloAtual of modelos) {
      const upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": PROD_ORIGIN,
          "X-Title": "Córtex Digital",
        },
        body: JSON.stringify({ ...payload, model: modeloAtual }),
      });
      const dados = await lerJsonSeguro(upstream);
      ultimoStatus = upstream.status;
      ultimoErro = dados;

      if (upstream.ok && !dados.error && dados.choices?.[0]) {
        const choice = dados.choices[0];
        return res.status(200).json({
          content: choice.message?.content || "",
          model: dados.model || modeloAtual,
          provider: "openrouter",
          usage: dados.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        });
      }
    }

    return res.status(502).json({
      error: "OpenRouter devolveu erro",
      status: ultimoStatus,
      detail: erroTexto(ultimoErro?.error || ultimoErro),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Proxy local compatível com /api/notion-export da Vercel ─
app.post("/api/notion-export", (req, res) => notionExportHandler(req, res));

// ── Proxy local compatível com /api/nim-proxy da Vercel ──────
app.post("/api/nim-proxy", async (req, res) => {
  const apiKey = lerNimKey();
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
    const dados = await lerJsonSeguro(upstream);
    return res.status(upstream.status).json(dados);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Ollama local ──────────────────────────────────────────
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
        options: { temperature: 0.3, num_predict: 512 },
      }),
    });
    const d = await r.json();
    res.json({ response: d.response || "", done: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Gemini proxy ──────────────────────────────────────────
app.post("/gemini/{*path}", async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    return res
      .status(503)
      .json({
        error: {
          message:
            "Gemini proxy sem key de servidor. Define GEMINI_API_KEY no .env",
        },
      });

  const path =
    req.params[0] || "v1beta/models/gemini-2.5-flash:generateContent";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/${path}?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      },
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
    gemini: process.env.GEMINI_API_KEY
      ? "✓ key configurada"
      : "sem key (define GEMINI_API_KEY)",
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Córtex Proxy em http://localhost:${PORT}`));
