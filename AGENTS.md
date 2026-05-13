# Córtex Digital — Contexto do Projeto

## Identificação

- **Aluno:** Alexandre — CTeSP Automação e Gestão Industrial, IPCB Castelo Branco
- **Versão atual:** v12
- **Localização local:** `C:\Users\Alexandre\Desktop\Computador Inteligência Adaptativa`
- **Ficheiro principal:** `src/cortex-digital.jsx`

## Stack

- React 18 + Vite 5.4.21
- Deploy: Vercel (sem servidor local)
- Proxy de APIs: Vercel serverless functions (`/api/*`)
- Sem Tailwind, sem shadcn, sem Express, sem SQLite

## Arquitetura

- 5 lobos oficiais em `src/api/council.js` com **Rei como juiz final** (`meta-llama/llama-3.3-70b-instruct:free` via OpenRouter)
- Router inteligente antes de chamar APIs — usa apenas os lobos oficiais importados de `LOBOS`
- Rei definido em `src/api/king.js` — usa `JUIZ_REI.modelo = "meta-llama/llama-3.3-70b-instruct:free"` e passa por `/api/chat` (proxy serverless OpenRouter)
- Runtime prompts: `src/api/council.js` e `src/api/king.js`; `/prompts/*.md` é documentação auxiliar e não é servido no Vercel
- OpenRouter passa por `/api/chat` (todos os 5 lobos + Rei via OpenRouter :free)
- NIM removido — `api/nim-proxy.js` mantido mas inactivo; todos os lobos migrados para OpenRouter
- Modelos activos (actualizados 2026-05-13 — tier :free rápido):
  | Lobe | Modelo |
  |---|---|
  | Analista Crítico | `deepseek/deepseek-r1-distill-llama-70b:free` |
  | Inovador Criativo | `google/gemma-3-12b-it:free` |
  | Pragmático Técnico | `microsoft/phi-4-reasoning-plus:free` |
  | Generalista Contextual | `openai/gpt-oss-120b:free` |
  | Advogado do Diabo | `qwen/qwen3-14b:free` |
  | **Rei** | `meta-llama/llama-3.3-70b-instruct:free` |
- Streaming SSE no council/chat: ✅ FEITO (`chamarLobeStream`, `runDebateStream`)
- Web search: `openrouter:web_search` server tool — activo em Analista Crítico (id=1) + Generalista (id=4); max_results 3, localização PT; custo ~$0.02/request via Exa; Rei não usa
- DateTime tool: activo em todos os lobos (Europe/Lisbon)
- Response Healing: plugin `{ id: "response-healing" }` activo no Rei via OpenRouter — corrige JSON malformado; Rei não usa streaming (non-streaming obrigatório para o plugin)
- Rei fallback: `openrouter/fusion` (pago, Claude Opus + GPT) — activa apenas quando Llama 3.3 falha ou devolve vazio
- F4-01 Upload imagens multimodal: ✅ FEITO — imagens seguem por `image_url` via OpenRouter content array; `imageDataUrl` é transitório, não persistido em histórico/localStorage; preview nativo aparece no chat
- Upload de PDF remoto: Substituído `pdfjs-dist` (local) pelo OpenRouter `file-parser` plugin (`cloudflare-ai` engine) enviado em Base64 — reduz ~500kb do bundle size
- Memória em `localStorage` (migração para Supabase planeada)
- Constante de versão: `const MV = "cortex-v12"` no topo do ficheiro

## Nomenclatura

- `lobos` = agentes individuais
- `council` = síntese final pelo Codex
- `pills` = botões da navbar
- `LOBOS` = array oficial de configuração dos 5 lobos em `src/api/council.js`
- `LOBES` = alias legado usado apenas como prop interna em `useCouncil`
- `P` = objeto de prompts
- `T` = tema atual (cores)
- `AC` = accent colors por modelo
- `invoke()` = função de chamada individual a cada lobe
- `send()` = função principal que dispara o council completo
- `chamarLobeStream()` = chamada SSE parcial por lobe em `council.js`
- `runDebateStream()` = debate multi-lobe com SSE e fallback para `chamarLobe()`
- `routerDecide()` = router inteligente de seleção de lobos
- `normalizeCouncilPayload()` = normaliza payload estruturado da resposta
- `safeParseReflect()` = parse seguro da reflexão

## Hooks

- `useCouncil.js` = orquestração do council, debate, juízes e Rei
- `useStreaming.js` = estado parcial por lobe durante streaming SSE
- `useAutoResize.js` = auto-resize do input principal do chat
- `useFileUpload.js` = F4-02 upload universal com extracção de texto, previews e `imageDataUrl` transitório para F4-01

## Componentes

- `BlueprintsPanel.jsx` = painel Mapas/Blueprints com padrões de arquitectura, RAG, IA, storage e checklist de lançamento
- `FileUpload.jsx` = zona visual de drag/drop para imagens, PDF, DOCX, TXT, CSV, XLSX e áudio
- `ChatBubble.jsx` = bolhas nativas para utilizador, lobos e Rei
- `AlertaBanner.jsx` = alertas inline de erro, aviso, info e sucesso
- `Toast.jsx` = notificações nativas com hook `useToast()`
- `LobeLoader.jsx` = loader pequeno por lobe com cor própria
- `EstadoVazio.jsx` = ecrã inicial sem histórico com sugestões clicáveis
- `SidePanel.jsx` = painel lateral direito deslizante para histórico, Blueprints e Modo Forense
- `Abas.jsx` = tabs nativas sem Radix usadas no debate
- `Slider.jsx` = range nativo para temperatura por lobe

## Forma de trabalho

- Patches incrementais, **um de cada vez**
- Substitui blocos exatos — nunca reescreve o ficheiro inteiro
- Não quebra funcionalidades existentes sem aviso explícito
- Usa `.catch(() => {})` onde integrações externas não podem quebrar a UX

## Skills disponíveis

- `.Codex/skills/cortex-digital` — skill principal do projeto

## Roadmap próximo

- ✅ Streaming SSE em `council.js` e chat — FEITO
- ✅ Feature 19: chips de sugestões rápidas do Rei — FEITO
- ✅ F4-01 Upload imagens multimodal — FEITO (`image_url` via OpenRouter content array; preview imagem no chat; `imageDataUrl` não persistido)
- ✅ F4-02 Upload Universal — FEITO (`useFileUpload.js`, `FileUpload.jsx`)
- ✅ Blueprints/Mapas — FEITO (`BlueprintsPanel.jsx`)
- ✅ Routing/API keys — FEITO (`/api/chat` para OpenRouter, `/api/nim-proxy` para NIM)
- ✅ Componentes 21st.dev adaptados — FEITO (`ChatBubble`, `AlertaBanner`, `Toast`, `LobeLoader`, `EstadoVazio`, `SidePanel`, `Abas`, `Slider`)
- ✅ Input com contador chars/tokens — FEITO
- ✅ Temperatura por lobe — FEITO (`Slider.jsx`)
- ✅ Side panels — FEITO (Histórico, Blueprints, Modo Forense)
- ✅ Modelos :free rápidos — FEITO (timeout 28s, 4 lobos substituídos 2026-05-13)
- ✅ Fix parser Rei — FEITO (`choices[0].message.content` em `king.js`)
- ✅ Web search — FEITO (`openrouter:web_search` em lobos 1+4, parser tool_calls, custo ~$0.02/req)
- Persistência real com Supabase (substituir localStorage)
- Conectores on-demand: Tavily, ElevenLabs, Obsidian, Notion
- Cloudflare: DNS + WAF + rate limiting + Turnstile
