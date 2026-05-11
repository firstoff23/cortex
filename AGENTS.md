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

- 5 lobos oficiais em `src/api/council.js` com **Rei/Codex como juiz final** (council pattern)
- Router inteligente antes de chamar APIs — usa apenas os lobos oficiais importados de `LOBOS`
- OpenRouter passa por `/api/chat`; NVIDIA NIM passa por `/api/nim-proxy` com key no servidor
- Streaming SSE no council/chat: ✅ FEITO (`chamarLobeStream`, `runDebateStream`)
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
- `useFileUpload.js` = F4-02 upload universal com extracção de texto e previews

## Componentes

- `BlueprintsPanel.jsx` = painel Mapas/Blueprints com padrões de arquitectura, RAG, IA, storage e checklist de lançamento
- `FileUpload.jsx` = zona visual de drag/drop para imagens, PDF, DOCX, TXT, CSV, XLSX e áudio

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
- ✅ F4-02 Upload Universal — FEITO (`useFileUpload.js`, `FileUpload.jsx`)
- ✅ Blueprints/Mapas — FEITO (`BlueprintsPanel.jsx`)
- ✅ Routing/API keys — FEITO (`/api/chat` para OpenRouter, `/api/nim-proxy` para NIM)
- Persistência real com Supabase (substituir localStorage)
- Conectores on-demand: Tavily, ElevenLabs, Obsidian, Notion
- Cloudflare: DNS + WAF + rate limiting + Turnstile
