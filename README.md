# Córtex Digital v12

Sistema de chat multi-agente com council de 11 lobos IA e síntese final por Claude.

## Stack

- **Frontend:** React 18 + Vite 5.4.21
- **Deploy:** Vercel
- **APIs:** Proxied via Vercel serverless functions (`/api/*`)
- **Memória:** localStorage (migração Supabase planeada)

## Arquitetura

O Córtex usa um padrão **council multi-modelo**:

1. O utilizador envia uma query
2. O `routerDecide()` decide quais lobos ativar
3. Os lobos são chamados em paralelo via `invoke()`
4. Claude sintetiza as respostas como juiz final
5. A reflexão e memória são atualizadas

## Modelos disponíveis (lobos)

| ID | Modelo | Provedor |
|---|---|---|
| claude | Claude 3.5 Sonnet | Anthropic |
| gpt | GPT-4o | OpenAI |
| gemini | Gemini 2.0 Flash | Google |
| grok | Grok-3 | xAI |
| groq | Llama 3.3 70B | Groq |
| perp | Sonar Pro | Perplexity |
| mistral | Mistral Large | Mistral |
| cohere | Command R+ | Cohere |
| deepseek | DeepSeek V3 | DeepSeek |
| qwen | Qwen 2.5 72B | Alibaba |
| ollama | Llama local | Ollama |

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
# ou push para main — Vercel faz deploy automático
```

## Variáveis de ambiente (Vercel)

As API keys são geridas via painel do Vercel como env vars do servidor.
Nunca expor keys no cliente.

## Roadmap

- [ ] Migração `invoke()` para OpenRouter
- [ ] Persistência com Supabase
- [ ] Conectores on-demand (Tavily, ElevenLabs, Notion, Obsidian)
- [ ] Cloudflare DNS + WAF + Turnstile
- [ ] Memória vetorial com Supabase pgvector
