# Córtex Digital v12

> Sistema de chat multi-agente com um conselho de 5 lobos especialistas de IA, síntese final por um Rei (Llama 3.3 70B via OpenRouter), streaming SSE em tempo real, memória persistente RAG (Supabase + pgvector) e pesquisa web ativa (Tavily).

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://cortex-five-hazel.vercel.app)
[![React](https://img.shields.io/badge/react-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-6.3.0-purple?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-private-red)](#)

---

## Demonstração

**URL de produção:** [https://cortex-five-hazel.vercel.app](https://cortex-five-hazel.vercel.app)

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18 + Vite 6.3.0 |
| **Estilos** | CSS Puro (Vanilla CSS), altamente responsivo |
| **Deploy** | Vercel (plano Hobby, deploys contínuos via `main`) |
| **APIs & Proxies** | Vercel Serverless Functions (`/api/*`) com timeouts ajustados para 60s |
| **Autenticação** | Clerk (GitHub OAuth & Dev Keys) |
| **Base de Dados & RAG** | Supabase com extensão `pgvector` (busca semântica por similaridade) |
| **Pesquisa Web** | Tavily Search API para grounding em tempo real |
| **Monitorização** | Sentry + PostHog |

---

## Arquitetura do Conselho

O Córtex funciona através de um padrão de **debate distribuído com juiz central**:

```
           Utilizador
               ↓ query
        routerDecide()         ← Seleciona automaticamente os lobos ativos
               ↓ paralelo
        invoke() × N Lobos     ← Streaming SSE por lobo (Ronda 1)
               ↓ debate
        Critique / Refine      ← Segunda ronda de feedback cruzado entre lobos
               ↓ consensos
        Síntese Ómega (Rei)    ← Rei Llama 3.3 avalia argumentos, calcula confiança e dita o veredicto
               ↓
     Persistência RAG (Sessão) ← Cria embeddings e guarda sumário/vetores no Supabase
```

### Ficheiros Principais

| Ficheiro | Função |
|---|---|
| [cortex-digital.jsx](file:///c:/Users/Alexandre/Desktop/Computador%20Intelig%C3%AAncia%20Adaptativa/src/cortex-digital.jsx) | Componente principal e ecrã de chat raiz |
| [council.js](file:///c:/Users/Alexandre/Desktop/Computador%20Intelig%C3%AAncia%20Adaptativa/src/api/council.js) | Definição oficial dos `LOBOS`, roteamento de query e execução do debate cognitivo |
| [useCouncil.js](file:///c:/Users/Alexandre/Desktop/Computador%20Intelig%C3%AAncia%20Adaptativa/src/hooks/useCouncil.js) | Orquestração do conselho, debate, grounding web e carregamento de contexto Supabase |
| [useFileUpload.js](file:///c:/Users/Alexandre/Desktop/Computador%20Intelig%C3%AAncia%20Adaptativa/src/hooks/useFileUpload.js) | Hook de Upload Universal com base64 e parser cloud-native |
| [useExport.js](file:///c:/Users/Alexandre/Desktop/Computador%20Intelig%C3%AAncia%20Adaptativa/src/hooks/useExport.js) | Exportações seguras dinâmicas para Word, Excel (`exceljs`) e Notion |

---

## Modelos do Conselho (v12)

Os 5 lobos oficiais do conselho e o Rei utilizam os seguintes modelos (com fallbacks automáticos em caso de falha de serviço no OpenRouter):

| Lobe | Modelo Principal | Função Primária |
|---|---|---|
| **Analista Crítico** | `qwen/qwen3-next-80b-a3b-instruct:free` | Factos, lógica matemática e pesquisa web |
| **Inovador Criativo** | `google/gemma-4-31b-it:free` | Brainstorming, conceitos e ideias fora da caixa |
| **Pragmático Técnico** | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | Arquitetura, código de sistemas e raciocínio profundo |
| **Generalista Contextual** | `openai/gpt-oss-120b:free` | Integração de perspetivas e pesquisa factual secundária |
| **Advogado do Diabo** | `nousresearch/hermes-3-llama-3.1-405b:free` | Mitigação de riscos, testes de falhas e refutação |
| **Juiz Final (Rei)** | `meta-llama/llama-3.3-70b-instruct:free` | Síntese integradora final (com fallback para `openrouter/fusion` pago) |

---

## Funcionalidades Implementadas

- **Streaming SSE em Tempo Real**: Tokens parciais visíveis por lobo durante a execução em paralelo.
- **Debate Multi-ronda**: Debate adaptativo de até 3 rondas (ativado condicionalmente na UI).
- **RAG & Supabase Vector Search**: Gravação automática de sumários e pesquisa semântica por vizinhos mais próximos com threshold `0.45` e limite de 3 itens.
- **Tavily Web Grounding**: Pesquisa dinâmica de notícias/dados atuais injetados no contexto do sistema antes da chamada dos lobos.
- **Upload Universal & Multimodal**: Suporte para PDF, DOCX, TXT, CSV, Excel (`exceljs`), imagens e áudio de voz. Os PDFs usam processamento em nuvem com o plugin `file-parser` da OpenRouter.
- **Painel de Observabilidade de Memória**: Permite ver o estado de armazenamento de embeddings Supabase, latência de buscas RAG e eliminação completa.
- **Exportação Multiformato**: Exportações seguras para Notion (serverless functions), Word e Excel.
- **Factory Approval Gates**: Interceção de comandos destrutivos ou complexos que requerem confirmação explícita do utilizador antes de processar.
- **Contador de Tokens/Caracteres**: Indicador visual dinâmico do tamanho da pergunta no input.
- **Multilinguismo PT-PT**: Localização completa e instruções com foco em português de Portugal.

---

## Desenvolvimento Local

Para evitar erros no proxy `/api` de serverless functions locais, deves utilizar a CLI do Vercel para correr o projeto em desenvolvimento:

```bash
# Instalar a CLI do Vercel globalmente (se não tiveres)
npm install -g vercel

# Instalar dependências do projeto
npm install

# Correr o projeto localmente emulado
vercel dev
```

O servidor local ficará disponível em `http://localhost:3000`.

### Variáveis de Ambiente

Cria um ficheiro `.env.local` na raiz com base no `.env.example` para configurar as variáveis de desenvolvimento. Em produção (Vercel), as chaves são geridas de forma segura através das variáveis de ambiente de sistema da plataforma.

---

## Scripts Disponíveis

- `npm run dev` / `vercel dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Compila a aplicação para produção (Vite).
- `npm run preview`: Previsualiza localmente o bundle de produção compilado.
- `npm run test`: Executa os testes unitários e de integração com Vitest.
- `npm run eval`: Executa o harness de evals (`evals/runEvals.js`).

---

*Córtex Digital v12 — Alexandre, IPCB Castelo Branco — Maio 2026*
