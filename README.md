# Córtex Digital v12

> Sistema de chat multi-agente com council de 11 lobos IA, síntese final por Claude e streaming em tempo real.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://cortex-five-hazel.vercel.app)
[![React](https://img.shields.io/badge/react-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-5.4.21-purple?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-private-red)](#)

---

## Demonstração

**URL de produção:** https://cortex-five-hazel.vercel.app

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5.4.21 |
| Deploy | Vercel (CD automático no push para `main`) |
| Proxies de API | Vercel Serverless Functions (`/api/*`) |
| Memória | `localStorage` (migração Supabase planeada) |
| Estilo | CSS puro (sem Tailwind, sem shadcn) |
| i18n | PT / EN |

---

## Arquitetura

O Córtex usa um padrão **council multi-modelo**:

```
Utilizador
    ↓ query
routerDecide()        ← decide quais lobos ativar
    ↓ paralelo
invoke() × N lobos    ← streaming SSE por lobo
    ↓ respostas
chamarRei() / Codex   ← síntese final como juiz
    ↓
Reflexão + Memória   ← atualiza localStorage
```

### Ficheiros principais

| Ficheiro | Função |
|---|---|
| `src/cortex-digital.jsx` | Componente raiz, UI principal |
| `src/api/council.js` | Array `LOBOS`, `invoke()`, `send()`, streaming |
| `src/hooks/useCouncil.js` | Orquestração do conselho, debate, juízes |
| `src/hooks/useStreaming.js` | Estado parcial por lobo durante SSE |
| `src/hooks/useFileUpload.js` | Upload universal (PDF, DOCX, TXT, CSV, XLSX, imagens) |
| `api/chat.js` | Proxy Vercel → OpenRouter |
| `api/nim-proxy.js` | Proxy Vercel → NVIDIA NIM |

### Componentes

| Componente | Descrição |
|---|---|
| `KingCard.jsx` | Card do lobo Rei (resposta final) |
| `LobeCard.jsx` | Card individual de cada lobo |
| `JudgeCard.jsx` | Card do juiz/Codex |
| `ClaudeCard.jsx` | Card específico Claude |
| `MessageList.jsx` | Lista de mensagens do chat |
| `DebateTimeline.jsx` | Timeline visual do debate multi-ronda |
| `BlueprintsPanel.jsx` | Painel de padrões de arquitetura / RAG / IA |
| `EvalsPanel.jsx` | Painel de avaliações dos lobos |
| `FileUpload.jsx` | Zona drag-and-drop para ficheiros |
| `FileUploadButton.jsx` | Botão de upload inline |
| `AgentPlan.jsx` | Plano e configuração dos agentes |

---

## Modelos disponíveis (lobos)

| ID | Modelo | Provedor |
|---|---|---|
| `claude` | Claude 3.5 Sonnet | Anthropic |
| `gpt` | GPT-4o | OpenAI |
| `gemini` | Gemini 2.0 Flash | Google |
| `grok` | Grok-3 | xAI |
| `groq` | Llama 3.3 70B | Groq |
| `perp` | Sonar Pro | Perplexity |
| `mistral` | Mistral Large | Mistral |
| `cohere` | Command R+ | Cohere |
| `deepseek` | DeepSeek V3 | DeepSeek |
| `qwen` | Qwen 2.5 72B | Alibaba |
| `ollama` | Llama local | Ollama |

Todos os modelos externos passam por `/api/chat` (OpenRouter) ou `/api/nim-proxy` (NVIDIA NIM). **Nenhuma API key é exposta no cliente.**

---

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

> O servidor local corre em `http://localhost:5173` por defeito.

### Variáveis de ambiente

Copia `.env.exemplo` para `.env.local` e preenche as chaves necessárias. **Nunca fazer commit de `.env.local`.**

Em produção, as chaves são geridas como **Environment Variables do servidor no Vercel** (nunca expostas no bundle do cliente).

---

## Deploy

O deploy é automático via Vercel:

```bash
# Qualquer push para main dispara deploy em produção
git push origin main

# Deploy manual (se necessário)
npm run build
vercel --prod
```

---

## Estrutura de pastas

```
córtex/
├── api/                    # Serverless functions (proxies)
├── middleware/             # Middleware Vercel
├── public/                 # Ficheiros estáticos
├── src/
│   ├── API/                # Clientes de API do lado cliente
│   ├── assets/             # Imagens e recursos estáticos
│   ├── components/         # Componentes React
│   ├── docs/               # Documentação interna do código
│   ├── hooks/              # Custom hooks React
│   ├── i18n/               # Traduções PT/EN
│   ├── lib/                # Utilitários e helpers
│   ├── utils/              # Funções auxiliares
│   ├── App.jsx
│   ├── cortex-digital.jsx  # Componente principal
│   ├── index.css
│   └── main.jsx
├── .env.exemplo
├── AGENTS.md               # Contexto para agentes IA
├── CLAUDE.md               # Instruções para Claude Code
├── SECURITY.md             # Política de segurança
├── package.json
├── vercel.json
└── vite.config.js
```

---

## Funcionalidades

- **Council multi-modelo** — até 11 lobos respondem em paralelo
- **Streaming SSE** — respostas em tempo real por lobo (`chamarLobeStream`, `runDebateStream`)
- **Debate multi-ronda** — lobos debatem entre si com `DebateTimeline`
- **Juiz final** — Claude/Codex sintetiza e veredita
- **Upload universal** — PDF, DOCX, TXT, CSV, XLSX, imagens com extração de texto
- **Blueprints/Mapas** — padrões de arquitetura, RAG, IA pré-definidos
- **Memória vetorial** — compressaão semântica em `localStorage`
- **Temas visuais** — Córtex, Grok, Neural, Obsidian, Midnight, Gemini, Perplexity, Crimson
- **i18n** — português e inglês
- **Router inteligente** — seleciona automaticamente os lobos mais adequados à query

---

## Segurança

Consulta [SECURITY.md](./SECURITY.md) para a política completa de segurança e como reportar vulnerabilidades.

---

## Roadmap

- [x] Streaming SSE no council e chat
- [x] Upload Universal (F4-02)
- [x] Blueprints / Mapas
- [x] Debate multi-ronda com timeline
- [x] AgentPlan — configuração visual dos agentes
- [ ] Persistência real com Supabase + pgvector
- [ ] Conectores on-demand: Tavily, ElevenLabs, Notion, Obsidian
- [ ] Cloudflare DNS + WAF + Turnstile
- [ ] Modo offline com Ollama local

---

*Córtex Digital v12 — Alexandre, IPCB Castelo Branco — Maio 2026*
