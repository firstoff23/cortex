---
name: cortex-digital
description: Skill completa do Córtex Digital v12 —
  sistema multi-agente React com 5 lobos, Council of Wolves,
  Rei como juiz final via OpenRouter, stack Vercel serverless.
  Projecto em: C:\Users\Alexandre\Desktop\Computador Inteligência Adaptativa
---

## Stack actual
- React 18 + Vite 5.4.21 (JSX puro, SEM TypeScript)
- Deploy: Vercel (serverless functions em /api/*)
- CSS variables nativas (SEM Tailwind, SEM shadcn)
- OpenRouter para todos os modelos (1 key)
- Ficheiro principal: src/cortex-digital.jsx
- Versão: const MV = "cortex-v12"

## Os 5 Lobos (LOBOS em src/api/council.js)
- Lobe 1 Analista Crítico:   deepseek/deepseek-r1-distill-llama-70b:free
- Lobe 2 Inovador Criativo:  google/gemma-3-12b-it:free
- Lobe 3 Pragmático Técnico: microsoft/phi-4-reasoning-plus:free
- Lobe 4 Generalista:        openai/gpt-oss-120b:free
- Lobe 5 Advogado do Diabo:  qwen/qwen3-14b:free
- Rei (Juiz Final):          meta-llama/llama-3.3-70b-instruct:free

## Arquitectura de ficheiros
src/
├── hooks/
│   ├── useCouncil.js      ← lobos + AbortController Map
│   ├── useMessages.js     ← histórico + edição
│   ├── useVoice.js        ← Web Speech API pt-PT + TTS
│   ├── useMobile.js       ← haptic + scroll
│   ├── useFileUpload.js   ← upload universal F4-02
│   ├── useAutoResize.js   ← auto-resize input
│   └── useStreaming.js    ← estado SSE por lobe
├── api/
│   ├── council.js         ← LOBOS, chamarLobe, runDebate
│   ├── king.js            ← chamarRei, JUIZ_REI
│   └── chat.js            ← proxy serverless OpenRouter
└── components/
    ├── BlueprintsPanel.jsx
    ├── FileUpload.jsx
    ├── ChatBubble.jsx
    ├── AlertaBanner.jsx
    ├── Toast.jsx
    ├── LobeLoader.jsx
    ├── EstadoVazio.jsx
    ├── SidePanel.jsx
    ├── Abas.jsx
    ├── Slider.jsx
    ├── ProgressBar.jsx
    └── DebateTimeline.jsx

## Variáveis de ambiente
OPENROUTER_API_KEY=sk-or-v1-xxxx  (servidor)
VITE_OPENROUTER_KEY=sk-or-v1-xxxx (browser)
GEMINI_API_KEY=                    (F4-01 multimodal)

## OpenRouter features activas
- openrouter:web_search (Lobe 1 + 4)
- openrouter:datetime (todos os lobos, Europe/Lisbon)
- file-parser PDF (cloudflare-ai, grátis)
- response-healing (Rei, non-streaming)
- Response Cache (ronda 1: TTL 300s, Rei: TTL 600s)
- Fallback de modelos via array models por lobe
- Auto Exacto activo automático (tool calling)

## Regras de código INVIOLÁVEIS
- JSX puro (NUNCA TypeScript/TSX)
- CSS variables nativas (NUNCA Tailwind)
- Promise.allSettled (NUNCA Promise.all)
- AbortController como Map() por lobe
- Comentários em PT-PT
- Patches incrementais — nunca reescreve ficheiro inteiro
- Lógica nos hooks, nunca nos componentes JSX
- Sem dependências novas sem justificação

## Nomenclatura do projecto
- lobos = agentes individuais
- LOBOS = array de configuração em council.js
- council = síntese final
- Rei/Juiz = orquestrador final em king.js
- pills = botões da navbar
- routerDecide() = router inteligente
- runDebate() = orquestra rondas 1 e 2
- chamarRei() = chama o juiz final

## Roadmap — estado actual
### Fase 4 — em curso (9/11 ✅)
✅ F4-00: Routing dinâmico
✅ F4-01: Upload imagens multimodal (image_url)
✅ F4-02: Upload Universal (PDF/DOCX/TXT/CSV/XLSX)
⏳ F4-03: Export Word/Excel/Notion
✅ F4-04: Voz STT + TTS
✅ F4-05: Citações inline
✅ F4-06: Defesas prompt injection
⏳ F4-07: Evals harness
⏳ F4-08: Multilinguismo PT real
✅ F4-09: Melhoria automática da pergunta
✅ F4-10: Compressão de contexto

### Fase 5 — a seguir
- Supabase (substituir localStorage)
- RAG Qdrant
- Memória entre sessões
- Guardrails

## Invocação
/cortex-digital [tarefa]

Exemplos:
  /cortex-digital corrige timeout no Analista Crítico
  /cortex-digital adiciona blueprint novo ao BlueprintsPanel
  /cortex-digital implementa F4-03 export Word
  /cortex-digital debug erro 502 no proxy
