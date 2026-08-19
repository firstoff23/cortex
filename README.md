<p align="center">
  <img src="./assets/cortex-banner.png" alt="Rede de agentes inteligentes convergindo para um núcleo central" width="100%" />
</p>

<h1 align="center">Córtex Digital</h1>

<p align="center">
  <strong>Um espaço de deliberação multi-agente para explorar perguntas complexas através de perspetivas especializadas.</strong>
</p>

<p align="center">
  <a href="https://cortex-five-hazel.vercel.app">Demonstração</a> ·
  <a href="#-começar">Começar</a> ·
  <a href="#-como-funciona">Como funciona</a> ·
  <a href="#-tecnologias">Tecnologias</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000" alt="JavaScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <a href="https://github.com/firstoff23/cortex/actions/workflows/readme-check.yml">
    <img src="https://github.com/firstoff23/cortex/actions/workflows/readme-check.yml/badge.svg" alt="Estado do workflow README checks" />
  </a>
  <a href="https://github.com/firstoff23/cortex/actions/workflows/quality-checks.yml">
    <img src="https://github.com/firstoff23/cortex/actions/workflows/quality-checks.yml/badge.svg" alt="Estado do workflow de testes e compilação" />
  </a>
</p>

---

## Visão geral

O **Córtex Digital** é uma aplicação de conversação multi-agente. Em vez de depender de uma única perspetiva, organiza uma questão entre especialistas com papéis distintos, promove uma fase de análise e crítica, e apresenta uma síntese final unificada. O projeto inclui *streaming* em tempo real, memória de sessão e pesquisa web contextual quando configurada.

> **Ideia central:** transformar perguntas abertas num processo transparente de debate, contraponto e síntese.

| Área | O que oferece |
| --- | --- |
| **Conselho multi-agente** | Especialistas com perspetivas complementares para analisar a mesma pergunta. |
| **Síntese final** | Uma resposta agregada após as fases de raciocínio e crítica. |
| **Memória contextual** | Persistência de contexto e pesquisa semântica suportadas por Supabase e `pgvector`. |
| **Grounding web** | Pesquisa web opcional para acrescentar contexto atual à deliberação. |
| **Experiência em tempo real** | Respostas por *streaming* SSE e indicadores de atividade dos agentes. |
| **Fluxos de trabalho** | Upload de ficheiros, exportação de resultados e controlos de confirmação para ações sensíveis. |

## Como funciona

O fluxo é orientado por um *router* que seleciona os agentes adequados à pergunta. Os agentes analisam o pedido em paralelo, podem criticar ou refinar argumentos e entregam o resultado ao componente de síntese. A sessão pode guardar contexto semântico para consultas posteriores.

```text
Pergunta do utilizador
        ↓
Seleção de especialistas
        ↓
Análise paralela com streaming
        ↓
Crítica e refinamento entre perspetivas
        ↓
Síntese final e memória de sessão
```

## Tecnologias

| Camada | Ferramentas principais |
| --- | --- |
| **Interface** | React 18 e Vite 6 |
| **Serviços** | Funções serverless e *proxy* Node.js |
| **Autenticação** | Clerk |
| **Memória e dados** | Supabase e `pgvector` |
| **Pesquisa contextual** | Tavily, quando configurado |
| **Observabilidade** | Sentry, PostHog e Langfuse |
| **Testes e qualidade** | Vitest, ESLint e Prettier |

## Começar

### Pré-requisitos

É necessário Node.js 20 ou superior. Para a experiência local completa, incluindo as funções em `/api`, utiliza a CLI da Vercel.

```bash
# Clonar o repositório
git clone https://github.com/firstoff23/cortex.git
cd cortex

# Instalar dependências
npm install

# Preparar configuração local
cp .env.example .env.local

# Executar com emulação de funções serverless
npx vercel dev
```

O ambiente local fica disponível no endereço indicado pela CLI. Antes de iniciar, preenche em `.env.local` as credenciais dos serviços que pretendes ativar. O ficheiro `.env.example` é a fonte de verdade para as variáveis necessárias; nunca publiques chaves ou *tokens* reais.

### Scripts úteis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite. |
| `npm run build` | Cria a versão de produção. |
| `npm run test` | Executa testes unitários e de integração com Vitest. |
| `npm run lint` | Verifica a qualidade do código. |
| `npm run eval` | Executa o conjunto de avaliações do projeto. |

## Demonstração

A aplicação está disponível em **[cortex-five-hazel.vercel.app](https://cortex-five-hazel.vercel.app)**.

## Segurança e privacidade

O projeto usa serviços externos configurados por variáveis de ambiente. Antes de fazer *deploy*, revê os acessos de autenticação, as políticas de base de dados e as chaves de API. Ficheiros de ambiente locais devem permanecer fora do controlo de versões.

## Autor

Desenvolvido por [Alexandre Santos Inácio](https://github.com/firstoff23).
