---
name: cortex-digital
description: Skill completa do Córtex Digital — padrões de código, memória partilhada, council synthesis, router inteligente e arquitetura escalável para o projeto em C:\Users\Alexandre\Desktop\Computador Inteligência Adaptativa
---

## Contexto rápido

Sistema multi-agente React com 11 lobos em paralelo, council synthesis via Claude como juiz, memória SQLite e proxy Ollama local. Stack: React 18, Express, SQLite, Tailwind, shadcn/ui. Ambiente: Windows 11 + PowerShell.

---

## Array LOBES — padrão do projeto

```js
const LOBES = [
  { id: 'gemini',        name: 'Gemini',      color: '#4285f4', active: true,  mode: 'normal', model: 'gemini-1.5-flash',    type: 'real'      },
  { id: 'llama',         name: 'LLaMA',       color: '#f55036', active: true,  mode: 'normal', model: 'llama-3.3-70b-versatile', type: 'real'   },
  { id: 'gemma',         name: 'Gemma',       color: '#34a853', active: true,  mode: 'normal', model: 'gemma2-9b-it',        type: 'real'      },
  { id: 'perplexity',    name: 'Perplexity',  color: '#20b2aa', active: true,  mode: 'normal', model: 'sonar-pro',           type: 'real'      },
  { id: 'claude',        name: 'Claude',      color: '#d97706', active: true,  mode: 'normal', model: 'claude-3-5-sonnet-20241022', type: 'judge' },
  { id: 'genspark',      name: 'Genspark',    color: '#8b5cf6', active: true,  mode: 'normal', model: 'simulated',           type: 'simulated' },
  { id: 'manus',         name: 'Manus',       color: '#ec4899', active: true,  mode: 'normal', model: 'simulated',           type: 'simulated' },
  { id: 'ollama_codigo', name: 'OllamaCód',   color: '#64748b', active: false, mode: 'normal', model: 'codellama',           type: 'local'     },
  { id: 'ollama_debug',  name: 'OllamaDbg',   color: '#475569', active: false, mode: 'normal', model: 'llama3',              type: 'local'     },
  { id: 'openai',        name: 'OpenAI',      color: '#10a37f', active: false, mode: 'normal', model: 'gpt-4o',              type: 'real'      }, // a integrar
  { id: 'deepseek',      name: 'DeepSeek',    color: '#4d6bfe', active: false, mode: 'normal', model: 'deepseek-chat',       type: 'real'      }, // a integrar
];
```

---

## Estrutura de resposta de lobo

```js
// Resposta bem-sucedida
{ id: 'gemini', content: '...', model: 'gemini-1.5-flash', tokensUsed: 820, latency: 1240, error: null }

// Resposta com erro
{ id: 'gemini', content: null, model: 'gemini-1.5-flash', tokensUsed: 0, latency: 0, error: 'API key inválida' }
```

---

## Padrão Council Synthesis

```js
// frontend: chama council endpoint
async function sendToCouncil(query, conversationId, activeLobes) {
  const res = await fetch('/api/council', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, conversationId, activeLobes })
  });
  return res.json(); // { responses: [...], synthesis: { content, model } }
}

// backend: routes/council.js
router.post('/council', async (req, res) => {
  const { query, conversationId, activeLobes = [] } = req.body;
  const context = Memory.readCompressed(conversationId);

  Memory.write(conversationId, null, 'user', query);

  const results = await Promise.allSettled(
    activeLobes
      .filter(id => id !== 'claude') // claude é o juiz, não participa na ronda
      .map(id => callAgent(id, query, context).then(r => ({ id, ...r })))
  );

  const responses = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  responses.forEach(r => {
    if (!r.error) Memory.write(conversationId, r.id, 'assistant', r.content, r.tokensUsed);
  });

  // Claude como juiz: sintetiza as respostas
  const synthesis = await callClaude(buildSynthesisPrompt(query, responses), context);
  Memory.write(conversationId, 'claude_judge', 'assistant', synthesis.content);

  res.json({ responses, synthesis });
});
```

---

## Router Inteligente

```js
// Nunca chama todos os 11 lobos ao mesmo tempo — escolhe por tipo de query
const ROUTING_RULES = [
  { pattern: /código|função|bug|erro|implementa|refactor|jsx|css|sql/i,
    agents: ['llama', 'gemma', 'ollama_codigo'] },
  { pattern: /pesquisa|notícia|atual|recente|2025|2026|web/i,
    agents: ['perplexity', 'gemini'] },
  { pattern: /matemática|cálculo|equação|fórmula|física/i,
    agents: ['gemini', 'llama'] },
  { pattern: /debug|trace|stack|erro|exception/i,
    agents: ['llama', 'ollama_debug', 'gemma'] },
  { pattern: /ideia|criativ|design|ux|ui/i,
    agents: ['gemini', 'genspark', 'manus'] },
  { pattern: /plano|taref|decompõe|organiza|projeto/i,
    agents: ['manus', 'gemini', 'genspark'] },
];

function routerDecide(query, availableLobes) {
  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(query)) {
      return rule.agents.filter(id => availableLobes.includes(id));
    }
  }
  return availableLobes.filter(id => id !== 'claude'); // sem match → todos exceto juiz
}
```

---

## Memória Partilhada (SQLite)

```sql
-- Schema completo
CREATE TABLE IF NOT EXISTS memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  agent_id TEXT,        -- NULL = input do utilizador
  role TEXT NOT NULL,   -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  conversation_id TEXT,  -- NULL = global
  api_key TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS seeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);
```

```js
// memory.js
const db = require('better-sqlite3')('cortex.db');

const Memory = {
  write: (convId, agentId, role, content, tokens = 0) =>
    db.prepare('INSERT INTO memory (conversation_id,agent_id,role,content,tokens_used) VALUES (?,?,?,?,?)')
      .run(convId, agentId, role, content, tokens),

  readAll: (convId, limit = 30) =>
    db.prepare('SELECT * FROM memory WHERE conversation_id=? ORDER BY timestamp DESC LIMIT ?')
      .all(convId, limit).reverse(),

  // Versão comprimida para poupar tokens nos prompts
  readCompressed: (convId, maxTokens = 2000) => {
    const rows = db.prepare('SELECT role,content,tokens_used FROM memory WHERE conversation_id=? ORDER BY timestamp DESC')
      .all(convId);
    let total = 0;
    return rows.filter(r => { total += (r.tokens_used || 80); return total <= maxTokens; }).reverse();
  },

  // API key: busca por conversa → global → .env
  getAPIKey: (provider, convId) => {
    const row = db.prepare('SELECT api_key FROM api_keys WHERE provider=? AND (conversation_id=? OR conversation_id IS NULL) ORDER BY conversation_id DESC LIMIT 1')
      .get(provider, convId);
    return row?.api_key || process.env[`${provider.toUpperCase()}_API_KEY`];
  }
};

module.exports = Memory;
```

---

## Proxy Ollama (proxy.js)

```js
// Arranca com: node proxy.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434';

app.post('/ollama', async (req, res) => {
  const { model = 'llama3', prompt, context = [] } = req.body;
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [...context, { role: 'user', content: prompt }], stream: false })
    });
    const data = await response.json();
    res.json({ content: data.message?.content, model });
  } catch (err) {
    res.status(500).json({ error: 'Ollama não está a correr. Inicia com: ollama serve' });
  }
});

app.listen(3001, () => console.log('Proxy Ollama em http://localhost:3001'));
```

---

## Hooks a criar (refactoring v10 → v11)

```
useAgents.js    — estado dos lobos (LOBES array, toggle ativo, modo max)
useMemory.js    — leitura/escrita SQLite, memória comprimida
useSeed.js      — seeds por conversa
useCouncil.js   — orquestração das chamadas paralelas + synthesis
useAPIKeys.js   — gestão de chaves por provider/conversa
useRouter.js    — routerDecide() e seleção de lobos ativos
```

---

## Funcionalidades em Desenvolvimento

- [ ] Pills OpenAI e DeepSeek na navbar + rotas Express
- [ ] Conectores UI: gerir providers com on/off, API key, modelo
- [ ] Modo máximo por lobo (context window máximo do modelo)
- [ ] API keys guardadas por conversa (sem re-inserção)
- [ ] Refactoring v10 → hooks separados
- [ ] Busca semântica na memória (embeddings)
- [ ] Cache de respostas para queries repetidas
- [ ] Botão "aprender isto" — adiciona resposta à memória manual
- [ ] Timeout + retry nas chamadas às APIs

---

## Regras de código

1. Só o patch necessário — nunca o ficheiro inteiro
2. Nomenclatura do projeto: lobos, council, seeds, pills, LOBES, P
3. API keys: sempre via `Memory.getAPIKey()` ou `process.env` — nunca literal
4. Novos lobos: entrada no array LOBES + rota `/api/[id]` + pill navbar
5. Erros: linha do problema + fix em máximo 3 linhas
6. Hooks: `useReducer` para estado complexo (LOBES array)
7. Sem boilerplate — importa só o necessário

---

## Comandos úteis (PowerShell)

```powershell
# Pasta do projeto
cd "C:\Users\Alexandre\Desktop\Computador Inteligência Adaptativa"

# Arrancar tudo
node proxy.js          # proxy Ollama (porta 3001)
node server.js         # backend Express (porta 3000)
npm run dev            # frontend Vite (porta 5173)

# Abrir VS Code
code .
```

---

## Invocação

`/cortex-digital [tarefa]`

Exemplos:
  /cortex-digital adiciona OpenAI ao LOBES com pill e rota Express
  /cortex-digital cria hook useCouncil com Promise.allSettled
  /cortex-digital implementa busca semântica na memória
  /cortex-digital adiciona modo max ao lobo Gemini
  /cortex-digital cria endpoint /api/deepseek com error handling e retry
