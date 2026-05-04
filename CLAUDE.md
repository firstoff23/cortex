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
- 11 lobos em paralelo com **Claude como juiz final** (council pattern)
- Router inteligente antes de chamar APIs — nunca os 11 ao mesmo tempo
- Memória em `localStorage` (migração para Supabase planeada)
- Constante de versão: `const MV = "cortex-v12"` no topo do ficheiro

## Nomenclatura
- `lobos` = agentes individuais
- `council` = síntese final pelo Claude
- `pills` = botões da navbar
- `LOBES` = array de configuração dos lobos
- `P` = objeto de prompts
- `T` = tema atual (cores)
- `AC` = accent colors por modelo
- `invoke()` = função de chamada individual a cada lobe
- `send()` = função principal que dispara o council completo
- `routerDecide()` = router inteligente de seleção de lobos
- `normalizeCouncilPayload()` = normaliza payload estruturado da resposta
- `safeParseReflect()` = parse seguro da reflexão

## Forma de trabalho
- Patches incrementais, **um de cada vez**
- Substitui blocos exatos — nunca reescreve o ficheiro inteiro
- Não quebra funcionalidades existentes sem aviso explícito
- Usa `.catch(() => {})` onde integrações externas não podem quebrar a UX

## Skills disponíveis
- `.claude/skills/cortex-digital` — skill principal do projeto

## Roadmap próximo
- Migração `invoke()` para OpenRouter (1 key para todos os modelos)
- Persistência real com Supabase (substituir localStorage)
- Conectores on-demand: Tavily, ElevenLabs, Obsidian, Notion
- Cloudflare: DNS + WAF + rate limiting + Turnstile
