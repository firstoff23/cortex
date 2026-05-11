import { useEffect, useMemo, useState } from "react";

const BLUEPRINTS = [
  {
    id: 'web-dev',
    titulo: 'Web Development',
    emoji: '🌐',
    categorias: [
      { nome: 'Frontend', items: ['React', 'Vite', 'CSS Variables', 'Web Components'] },
      { nome: 'Backend', items: ['Node.js', 'Express', 'Serverless Functions', 'Edge Functions'] },
      { nome: 'API', items: ['REST', 'GraphQL', 'WebSocket', 'SSE'] },
      { nome: 'Database', items: ['PostgreSQL', 'Supabase', 'Redis', 'Qdrant'] },
    ]
  },
  {
    id: 'storage',
    titulo: 'Storage Patterns',
    emoji: '🗄️',
    categorias: [
      { nome: 'Browser', items: ['localStorage', 'sessionStorage', 'IndexedDB', 'Cookies'] },
      { nome: 'Cache', items: ['Redis', 'CDN Edge Cache', 'Service Worker', 'Memory Cache'] },
      { nome: 'Cloud', items: ['Object Storage (S3)', 'Supabase Storage', 'R2 Cloudflare'] },
      { nome: 'Database', items: ['SQL (relacional)', 'NoSQL (documentos)', 'Vector DB (Qdrant)'] },
    ]
  },
  {
    id: 'backend-api',
    titulo: 'Backend Architecture',
    emoji: '⚙️',
    categorias: [
      { nome: 'Camadas', items: ['Routes', 'Controllers', 'Services', 'Repositories'] },
      { nome: 'Middleware', items: ['Auth JWT', 'Rate Limiting', 'CORS', 'Logging'] },
      { nome: 'Schemas', items: ['Validação entrada', 'DTOs', 'OpenAPI/Swagger'] },
      { nome: 'Boas práticas', items: ['Stateless sessions', 'Filas async', 'Background jobs', 'Load test antes de lançar'] },
    ]
  },
  {
    id: 'rag',
    titulo: 'RAG Patterns',
    emoji: '🧠',
    categorias: [
      { nome: 'Tipos', items: ['Traditional RAG', 'Adaptive RAG', 'Agentic RAG', 'Hybrid RAG'] },
      { nome: 'Técnicas', items: ['Reranker', 'Sub-question decomposition', 'RAG + CAG', 'HyDE'] },
      { nome: 'Pipeline', items: ['Chunk → Embed → Store → Retrieve → Augment → Generate'] },
      { nome: 'No Córtex', items: ['Qdrant (planeado F5-01)', 'Memória entre sessões (F5-02)'] },
    ]
  },
  {
    id: 'modelos-ia',
    titulo: 'Modelos IA',
    emoji: '🤖',
    categorias: [
      { nome: 'Tipos', items: ['LLM (texto)', 'VLM (visão+texto)', 'SLM (pequenos)', 'MLM (multimodal)'] },
      { nome: 'Arquitectura', items: ['MoE (Mixture of Experts)', 'LCM (Large Concept)', 'LAM (Action)', 'SAM (Segment)'] },
      { nome: 'No Córtex', items: ['DeepSeek-R1', 'Gemini Flash', 'Llama 4 Scout', 'Nemotron 70B', 'Mistral Small', 'Claude Sonnet'] },
      { nome: 'Routing', items: ['Por complexidade (routerDecide)', 'Por tipo tarefa', 'Por custo/latência'] },
    ]
  },
  {
    id: 'multi-agent',
    titulo: 'Multi-Agent Patterns',
    emoji: '🐺',
    categorias: [
      { nome: 'Padrões', items: ['Council Pattern (actual)', 'Pipeline (série)', 'Router (routerDecide)', 'Reflection (auto-crítica)'] },
      { nome: 'Orchestration', items: ['Orchestrator + Subagents', 'Peer-to-peer', 'Hierarchical', 'Blackboard'] },
      { nome: 'Comunicação', items: ['Shared context (debate)', 'Tool calls', 'Memory shared', 'Event-driven'] },
      { nome: 'No Córtex', items: ['5 lobos paralelos', 'Ronda 1 + Ronda 2', 'Juiz Claude', 'Score consenso'] },
    ]
  },
  {
    id: 'prompting',
    titulo: 'Prompting Techniques',
    emoji: '💬',
    categorias: [
      { nome: 'Básico', items: ['Zero-shot', 'Few-shot (exemplos)', 'System vs User prompt', 'Role prompting'] },
      { nome: 'Avançado', items: ['Chain-of-Thought (CoT)', 'Tree of Thoughts (ToT)', 'ReAct', 'Self-consistency'] },
      { nome: 'No Córtex', items: ['System prompt por lobe', 'Contexto debate ronda1→2', 'Citações inline [Lobe X]'] },
      { nome: 'Anti-patterns', items: ['Prompt injection', 'Jailbreak', 'Prompt leaking', 'Context overflow'] },
    ]
  },
  {
    id: 'launch-checklist',
    titulo: 'Checklist Lançamento',
    emoji: '🚀',
    categorias: [
      { nome: 'Performance', items: ['Load test (k6/Artillery)', 'Bundle size < 500kb', 'Lazy imports', 'CDN activo'] },
      { nome: 'Segurança', items: ['Rate limiting', 'Input sanitization', 'CORS configurado', 'Keys no .env'] },
      { nome: 'UX', items: ['Mobile-first testado', 'Error states visíveis', 'Loading states', 'Empty states'] },
      { nome: 'Backend', items: ['Sessões stateless', 'Uploads em object storage', 'Filas para jobs longos', 'Logs estruturados'] },
    ]
  },
];

function contemTexto(blueprint, termo) {
  const alvo = termo.trim().toLowerCase();
  if (!alvo) return true;
  if (blueprint.titulo.toLowerCase().includes(alvo)) return true;
  return blueprint.categorias.some((categoria) =>
    categoria.nome.toLowerCase().includes(alvo) ||
    categoria.items.some((item) => item.toLowerCase().includes(alvo))
  );
}

function Pill({ children, destaque }) {
  return (
    <span
      style={{
        background: destaque ? 'rgba(34,197,94,0.1)' : 'rgba(168,85,247,0.1)',
        border: destaque ? '1px solid #22c55e' : '1px solid var(--accent, #a855f7)',
        borderRadius: '20px',
        padding: '2px 10px',
        fontSize: '12px',
        color: destaque ? '#22c55e' : 'var(--accent, #a855f7)',
        lineHeight: 1.8,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function Categoria({ categoria }) {
  const destaque = categoria.nome === 'No Córtex';

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <h3
        style={{
          margin: 0,
          fontSize: '0.82rem',
          color: destaque ? '#22c55e' : 'var(--text, #f5f5ff)',
          fontWeight: 800,
        }}
      >
        {categoria.nome}
      </h3>
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        {categoria.items.map((item, index) => (
          <Pill key={`blueprint-item-${index}-${item.slice(0, 18)}`} destaque={destaque}>
            {item}
          </Pill>
        ))}
      </div>
    </section>
  );
}

export default function BlueprintsPanel({ onVoltar, compact = false }) {
  const [filtro, setFiltro] = useState('');
  const [activo, setActivo] = useState(BLUEPRINTS[0].id);
  const [mobile, setMobile] = useState(() => window.innerWidth < 760);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filtrados = useMemo(
    () => BLUEPRINTS.filter((blueprint) => contemTexto(blueprint, filtro)),
    [filtro],
  );

  useEffect(() => {
    if (filtrados.length > 0 && !filtrados.some((blueprint) => blueprint.id === activo)) {
      setActivo(filtrados[0].id);
    }
  }, [activo, filtrados]);

  return (
    <main
      style={{
        minHeight: compact ? 'auto' : '100vh',
        background: compact ? 'transparent' : 'var(--bg, #08080c)',
        color: 'var(--text, #f5f5ff)',
        padding: compact ? 0 : mobile ? '0.85rem' : '1.25rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: compact ? '100%' : 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <header
          style={{
            display: 'flex',
            alignItems: mobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexDirection: mobile ? 'column' : 'row',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: mobile ? '1.35rem' : '1.8rem', letterSpacing: 0 }}>
              🗺️ Mapas do Córtex
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted, #8a8aa8)', fontSize: '0.9rem' }}>
              Blueprints rápidos para arquitectura, IA, RAG, storage e lançamento.
            </p>
          </div>

          <button
            onClick={onVoltar}
            style={{
              background: 'var(--card-bg, var(--bg-secondary, #101018))',
              border: '1px solid var(--border, rgba(255,255,255,0.12))',
              borderRadius: '8px',
              color: 'var(--text, #f5f5ff)',
              padding: '0.65rem 0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              alignSelf: mobile ? 'flex-start' : 'center',
            }}
          >
            ← Voltar ao chat
          </button>
        </header>

        <input
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
          placeholder="Filtrar por título, categoria ou item..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--card-bg, var(--bg-secondary, #101018))',
            border: '1px solid var(--border, rgba(255,255,255,0.12))',
            borderRadius: '12px',
            padding: '0.8rem 1rem',
            color: 'var(--text, #f5f5ff)',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: '0.75rem',
          }}
        >
          {filtrados.map((blueprint) => {
            const expandido = activo === blueprint.id;
            const categoriasVisiveis = expandido ? blueprint.categorias : blueprint.categorias.slice(0, 1);

            return (
              <article
                key={`blueprint-${blueprint.id}`}
                onClick={() => setActivo(blueprint.id)}
                style={{
                  background: 'var(--card-bg, var(--bg-secondary, #101018))',
                  border: expandido
                    ? '1px solid var(--accent, #a855f7)'
                    : '1px solid var(--border, rgba(255,255,255,0.12))',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: expandido ? '0 0 24px rgba(168,85,247,0.14)' : 'none',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.45rem' }}>{blueprint.emoji}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--text, #f5f5ff)' }}>
                      {blueprint.titulo}
                    </h2>
                    <div style={{ marginTop: 2, fontSize: '0.72rem', color: 'var(--text-muted, #8a8aa8)' }}>
                      {expandido ? 'Expandido' : `${blueprint.categorias.length} categorias`}
                    </div>
                  </div>
                  <span style={{ color: 'var(--accent, #a855f7)', fontSize: '1rem' }}>
                    {expandido ? '▼' : '▶'}
                  </span>
                </div>

                {categoriasVisiveis.map((categoria, index) => (
                  <Categoria key={`blueprint-cat-${blueprint.id}-${index}-${categoria.nome}`} categoria={categoria} />
                ))}
              </article>
            );
          })}
        </div>

        {filtrados.length === 0 && (
          <div
            style={{
              background: 'var(--card-bg, var(--bg-secondary, #101018))',
              border: '1px solid var(--border, rgba(255,255,255,0.12))',
              borderRadius: '12px',
              padding: '1rem',
              color: 'var(--text-muted, #8a8aa8)',
              textAlign: 'center',
            }}
          >
            Nenhum mapa encontrado para esse filtro.
          </div>
        )}
      </div>
    </main>
  );
}
