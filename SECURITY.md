# Política de Segurança — Córtex Digital

## Versões suportadas

Apenas a versão mais recente em produção recebe correções de segurança.

| Versão | Suportada          |
|--------|--------------------|
| v12.x  | :white_check_mark: |
| < v12  | :x:                |

## Âmbito

Este repositório contém apenas código **frontend** (React/Vite) e **funções serverless** (Vercel). Não existe base de dados local nem servidor dedicado.

Componentes em âmbito:
- `src/` — Componente React principal e lógica do cliente
- `api/` — Funções serverless Vercel (proxies para APIs externas)
- `middleware/` — Middleware Vercel
- `public/` — Ficheiros estáticos

Fora do âmbito:
- Infraestrutura dos provedores de IA (Anthropic, Google, xAI, Groq, etc.)
- Plataforma Vercel em si
- Chaves de API armazenadas nas variáveis de ambiente do Vercel

## Reportar uma Vulnerabilidade

Se encontrares uma vulnerabilidade de segurança, **não abras um Issue público**.

Contacta diretamente através de:
- **GitHub**: Usa a aba [Security > Report a vulnerability](../../security/advisories/new) neste repositório
- **Email**: Contacto privado com o mantenedor do projeto

### O que incluir no relatório

1. Descrição clara da vulnerabilidade
2. Passos para reproduzir o problema
3. Impacto potencial estimado
4. Sugestão de correção (opcional)

### Processo de resposta

- **Confirmação**: Resposta em até 5 dias úteis
- **Avaliação**: Análise e classificação de severidade em até 14 dias
- **Correção**: Patch lançado conforme a severidade (crítico: 48h, alto: 7 dias, médio/baixo: próxima release)
- **Divulgação**: Coordenada com o reportador após correção aplicada

## Práticas de segurança do projeto

### Chaves de API
- Todas as API keys são geridas exclusivamente como **variáveis de ambiente do servidor** no Vercel
- Nenhuma key é exposta no bundle do cliente
- O cliente nunca acede diretamente às APIs externas — tudo passa pelos proxies em `/api/*`

### Dados do utilizador
- Memória e conversas são armazenadas em **`localStorage`** no browser do utilizador
- Nenhum dado pessoal é enviado para servidores próprios (apenas para os provedores de IA escolhidos)
- Migração para Supabase planeada — com Row Level Security (RLS) ativo por defeito

### Dependências
- Dependências monitorizadas via **Dependabot** (PRs automáticos de atualização)
- Apenas dependências de produção mínimas e bem mantidas

### Content Security Policy
- Headers de segurança configurados via `vercel.json`
- HTTPS obrigatório em produção (garantido pela Vercel)

## Divulgação responsável

Comprometemo-nos a:
- Não tomar ações legais contra investigadores de segurança que reportem de boa fé
- Reconhecer publicamente os contribuidores de segurança (se desejado)
- Corrigir vulnerabilidades válidas o mais rapidamente possível

---

*Última atualização: Maio 2026 — Córtex Digital v12*
