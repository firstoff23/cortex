# Planeamento: Modo Offline com Ollama

> Branch: `feature/offline-ollama` | Issue: #11

## Estado

- [ ] Em desenvolvimento

## Funcionalidades planeadas

- Deteção automática de Ollama em `localhost:11434`
- Seleção de modelo (llama3, mistral, phi3, gemma, etc.)
- Fallback automático se APIs cloud falham
- Endpoint Ollama configurável pelo utilizador
- Indicador visual de modo offline ativo

## Ficheiros a criar/modificar

- `src/api/ollama.js` — cliente Ollama local
- `src/components/OllamaStatus.jsx` — indicador de estado
- `src/hooks/useOllama.js` — hook de deteção e uso
- `src/utils/modelFallback.js` — lógica de fallback

## Notas

Ver issue #11 para detalhes completos das tarefas.
