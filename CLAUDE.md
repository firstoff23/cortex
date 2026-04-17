# Córtex Digital — Contexto do Projeto

Localização: C:\Users\Alexandre\Desktop\Computador Inteligência Adaptativa
Versão atual: v10 (refactoring em curso para hooks separados)
Aluno: Alexandre — CTeSP Automação e Gestão Industrial, IPCB Castelo Branco

Stack: React 18 + Vite, Tailwind CSS, shadcn/ui, Express.js, SQLite (better-sqlite3)
Ambiente: Windows 11, PowerShell, VS Code, Node.js

11 lobos em paralelo, Claude como juiz final (council pattern)
Router inteligente antes de chamar APIs — nunca os 11 ao mesmo tempo
Proxy local proxy.js para Ollama em localhost:3001
Memória SQLite: tabelas messages, memory, api_keys, conversations, seeds

Nomenclatura: lobos=agentes, council=síntese, pills=navbar, seeds=estado, LOBES=array, P=prompts

Skill disponível: /cortex-digital
