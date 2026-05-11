// council.js — lobos v2.0 e debate multi-ronda

import { runKing } from './king.js';

export const LOBOS = [
  {
    id: 1,
    nome: 'Analista Crítico',
    modelo: 'deepseek/deepseek-r1',
    provider: 'openrouter',
    cor: '#ef4444',
  },
  {
    id: 2,
    nome: 'Inovador Criativo',
    modelo: 'google/gemini-flash-1.5',
    provider: 'openrouter',
    cor: '#22c55e',
  },
  {
    id: 3,
    nome: 'Pragmático Técnico',
    modelo: 'nvidia/llama-3.1-nemotron-70b-instruct',
    provider: 'nim',
    cor: '#3b82f6',
  },
  {
    id: 4,
    nome: 'Generalista Contextual',
    modelo: 'meta/llama-4-scout',
    provider: 'nim',
    cor: '#eab308',
  },
  {
    id: 5,
    nome: 'Advogado do Diabo',
    modelo: 'mistralai/mistral-small-3.1',
    provider: 'openrouter',
    cor: '#6b7280',
  },
];

export const SYSTEM_PROMPTS = {
  1: `És o Analista Crítico do Córtex Digital.
Voz: seca, cirúrgica, implacável — mas construtiva.
Missão: impedir más decisões antes de custarem caro.
Processo:
1. Desmonta a pergunta — premissas ocultas, evidências
   frágeis, riscos técnicos e éticos, pontos de rutura.
2. Usa lógica fria. Frases curtas. Perguntas incómodas.
3. Ronda 2: reage explicitamente a cada lobe pelo nome.
   Aponta contradições, excesso de optimismo ou falta
   de rigor. Reconhece argumentos sólidos sem hesitar.
Regra hard: nunca usas 'pode ser que' sem evidência.
PT-PT. Máx 130 palavras.`,

  2: `És o Inovador Criativo do Córtex Digital.
Voz: energética, lateral, provocadora — com sementes reais.
Missão: abrir possibilidades que os outros não viram.
Processo:
1. Reformula o problema de um ângulo completamente novo.
   Propõe 1 ideia radical com 3 passos concretos.
2. Usa 'E se...?' com frequência. Quebra todos os
   pressupostos. Analogias de outros sectores.
3. Ronda 2: pega na crítica do Analista e transforma-a
   num trampolim. Funde perspectivas de lobos diferentes
   numa síntese original e ousada.
Regra hard: nunca repetes o óbvio.
PT-PT. Máx 130 palavras.`,

  3: `És o Pragmático Técnico do Córtex Digital.
Voz: concisa, operacional, orientada para execução real.
Missão: dizer como fazer, com quê e em que ordem.
Processo:
1. Responde sempre neste formato:
     Stack: [tecnologias]
     Passos: 1. 2. 3.
     Tempo: [X dias/sprints]
     Risco principal: [1 frase]
2. Avalia viabilidade com frieza — orçamento, prazos,
   dependências, manutenção, escalabilidade.
3. Ronda 2: aponta lacunas práticas nas propostas dos
   outros. Pergunta sempre 'como?' e 'com quê?'.
   Converte a ideia criativa em requisitos técnicos reais.
Regra hard: sem passos concretos não é uma resposta.
PT-PT. Máx 130 palavras.`,

  4: `És o Generalista do Córtex Digital.
Voz: calma, lúcida, estratégica — sempre no quadro inteiro.
Missão: garantir que a decisão faz sentido no sistema real.
Processo:
1. Analisa em 3 níveis: o que foi pedido, o que é
   realmente necessário, o que está em jogo a longo prazo.
2. Liga a tendências históricas, padrões de outros
   domínios, incentivos das partes, impacto no utilizador.
3. Ronda 2: cose as perspectivas — mostra como a crítica
   do Analista e a visão do Criativo coexistem num todo.
   Alerta para efeitos de segunda ordem que ninguém viu.
Regra hard: nunca respondes só ao detalhe isolado.
PT-PT. Máx 130 palavras.`,

  5: `És o Advogado do Diabo do Córtex Digital.
Voz: irónica, incómoda, anti-conformista — sempre lógica.
Missão: testar a verdade por oposição, não por vaidade.
Processo:
1. Identifica a tese dominante que está a formar-se.
   Constrói o melhor argumento contrário possível.
2. Usa redução ao absurdo, dados ou cenários alternativos
   para testar a robustez do argumento principal.
3. Ronda 2: abre SEMPRE com —
   'A maioria inclina-se para X. Vou defender o contrário:'
   Ataca onde os outros estão mais confortáveis.
   Se o consenso for sólido, explica porquê sobreviveu.
Regra hard: cada resposta termina OBRIGATORIAMENTE com —
'A questão que ninguém fez: [pergunta]'
PT-PT. Máx 130 palavras.`,
};

export const SYSTEM_REI = `És o Juiz Final do Córtex Digital — chamado de Rei.
Voz: autoritária mas justa, fundamentada, transparente.
Missão: sintetizar o debate dos 5 lobos numa resposta
definitiva que o utilizador possa confiar e usar.
Processo obrigatório:
1. Lê TODAS as rondas do debate (ronda1 + ronda2).
2. Identifica: onde os lobos concordaram, divergiram,
   e qual divergência foi mais relevante.
3. Cita os lobos inline: [Analista], [Criativo],
   [Pragmático], [Generalista], [Diabo].
4. Calcula score de consenso: 'X/5 lobos alinhados'.
5. Emite veredicto fundamentado — não é média das
   opiniões, é síntese crítica com posição própria.
6. Se os lobos não convergirem, diz claramente:
   'Inconclusivo — razão: [...]'
7. Termina SEMPRE com 3 sugestões em formato:
   SUGESTÕES: ['...', '...', '...']
Regras hard:
- Nunca inventas factos — se não há evidência, diz.
- Cada afirmação tem origem [Lobe X].
- Admites 'não sei' com score de incerteza 0-100%.
PT-PT. Sem limite de palavras.`;

export function getBaseURL(provider) {
  if (provider === 'openrouter') return 'https://openrouter.ai/api/v1';
  if (provider === 'nim') return '/api/nim-proxy';
  throw new Error(`Provider desconhecido: ${provider}`);
}

function lerEnv(nome) {
  const processEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const viteEnv = import.meta.env || {};
  return processEnv[nome] || viteEnv[nome] || '';
}

export function getAPIKey(provider) {
  if (provider === 'openrouter') return lerEnv('VITE_OPENROUTER_KEY') || 'proxy-gerido-pelo-servidor';
  if (provider === 'nim') return 'proxy-gerido-pelo-servidor';
  return '';
}

function mensagemUtilizador(pergunta, contextoDebate) {
  if (!contextoDebate) return pergunta;
  return `Pergunta original: ${pergunta}

O que os outros lobos disseram na Ronda 1:
${contextoDebate}

Reage agora mantendo a tua personalidade.
Cita os outros lobos pelo nome.`;
}

function normalizarRespostaLobe(lobe, resposta, contextoDebate) {
  let texto = String(resposta || '').trim();
  if (contextoDebate && lobe.id === 5 && !/A questão que ninguém fez/i.test(texto)) {
    texto = `${texto}\nA questão que ninguém fez: que hipótese faria a maioria mudar de ideias?`.trim();
  }
  return texto;
}

function normalizarValorLobe(lobe, valor, contextoDebate) {
  const resposta = typeof valor === 'string' ? valor : valor?.resposta || valor?.result || '';
  return {
    ...(typeof valor === 'object' && valor ? valor : {}),
    id: valor?.id ?? lobe.id,
    nome: valor?.nome || lobe.nome,
    modelo: valor?.modelo || lobe.modelo,
    provider: valor?.provider || lobe.provider,
    resposta: normalizarRespostaLobe(lobe, resposta, contextoDebate),
  };
}

export async function chamarLobe(lobe, pergunta, contextoDebate = null, options = {}) {
  const apiKey = getAPIKey(lobe.provider);
  if (!apiKey) throw new Error(`API key ausente para ${lobe.provider}`);

  const system = SYSTEM_PROMPTS[lobe.id];
  const messages = [{ role: 'user', content: mensagemUtilizador(pergunta, contextoDebate) }];
  const body =
    lobe.provider === 'openrouter'
      ? { model: lobe.modelo, system, messages, max_tokens: options.max_tokens || 420 }
      : {
          model: lobe.modelo,
          messages: [
            { role: 'system', content: system },
            ...messages,
          ],
          max_tokens: options.max_tokens || 420,
        };

  const resposta = await fetch(
    lobe.provider === 'nim' ? getBaseURL(lobe.provider) : '/api/chat',
    {
    method: 'POST',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(lobe.provider !== 'nim' &&
        apiKey !== 'proxy-gerido-pelo-servidor' && {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cortex-digital.vercel.app',
          'X-Title': 'Córtex Digital',
        }),
    },
    body: JSON.stringify(body),
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok || dados.error) {
    throw new Error(dados.error?.message || dados.error || `HTTP ${resposta.status}`);
  }

  const texto = dados.choices?.[0]?.message?.content || dados.content || '';
  return normalizarValorLobe(lobe, { resposta: texto }, contextoDebate);
}

export async function chamarLobeStream(lobe, pergunta, contextoDebate = null, options = {}) {
  if (lobe.provider === 'nim') throw new Error('Stream SSE indisponível via proxy NIM');

  const apiKey = lerEnv('VITE_OPENROUTER_KEY');
  if (!apiKey) throw new Error(`API key ausente para ${lobe.provider}`);

  const resposta = await fetch(`${getBaseURL(lobe.provider)}/chat/completions`, {
    method: 'POST',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://cortex-digital.vercel.app',
      'X-Title': 'Córtex Digital',
    },
    body: JSON.stringify({
      model: lobe.modelo,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[lobe.id] },
        { role: 'user', content: mensagemUtilizador(pergunta, contextoDebate) },
      ],
      max_tokens:
        options.max_tokens ||
        (lobe.modelo.includes('deepseek') ? 1200 : lobe.modelo.includes('llama-4') ? 800 : 420),
    }),
  });

  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  if (!resposta.body?.getReader) throw new Error('Stream SSE indisponível');

  const reader = resposta.body.getReader();
  const decoder = new TextDecoder();
  let textoCompleto = '';
  let buffer = '';
  let terminado = false;

  while (!terminado) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const linhas = buffer.split('\n');
    buffer = linhas.pop() || '';

    for (const linha of linhas) {
      const limpa = linha.trim();
      if (!limpa.startsWith('data: ')) continue;

      const dados = limpa.slice(6).trim();
      if (dados === '[DONE]') {
        terminado = true;
        break;
      }

      try {
        const json = JSON.parse(dados);
        const delta = json.choices?.[0]?.delta?.content || '';
        if (delta) {
          textoCompleto += delta;
          options.onToken?.(delta, textoCompleto, lobe);
        }
      } catch {
        // Linhas SSE malformadas não devem quebrar a UX.
      }
    }
  }

  return normalizarValorLobe(lobe, { resposta: textoCompleto }, contextoDebate);
}

export function chamarRei(...args) {
  return runKing(...args);
}

async function chamarComMapa(lobe, pergunta, contextoDebate, mapa, chamar) {
  const ctrl = new AbortController();
  mapa.set(lobe.id, ctrl);
  try {
    const valor = await chamar(lobe, pergunta, contextoDebate, { signal: ctrl.signal });
    return normalizarValorLobe(lobe, valor, contextoDebate);
  } finally {
    if (mapa.get(lobe.id) === ctrl) mapa.delete(lobe.id);
  }
}

export async function runDebate(pergunta, modo = 'paralelo', options = {}) {
  const lobos = options.lobos || LOBOS;
  const chamar = options.chamarLobe || chamarLobe;
  const ronda1Map = new Map();

  const ronda1 = await Promise.allSettled(
    lobos.map((lobe) => chamarComMapa(lobe, pergunta, null, ronda1Map, chamar))
  );

  if (modo === 'paralelo') return { ronda1 };

  const contextoDebate = ronda1
    .filter((r) => r.status === 'fulfilled')
    .map((r) => `[${r.value.nome}]: ${r.value.resposta}`)
    .join('\n\n');

  const ronda2Map = new Map();
  const ronda2 = await Promise.allSettled(
    lobos.map((lobe) => chamarComMapa(lobe, pergunta, contextoDebate, ronda2Map, chamar))
  );

  return { ronda1, ronda2 };
}

async function chamarStreamComFallback(lobe, pergunta, contextoDebate, chamarStream, chamarFallback, onToken) {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);

  try {
    return await chamarStream(lobe, pergunta, contextoDebate, {
      signal: ctrl.signal,
      onToken,
    }).catch(() =>
      chamarFallback(lobe, pergunta, contextoDebate, {
        signal: ctrl.signal,
      }),
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function runDebateStream(pergunta, modo = 'paralelo', options = {}) {
  const lobos = options.lobos || LOBOS;
  const chamarStream = options.chamarLobeStream || chamarLobeStream;
  const chamarFallback = options.chamarLobe || chamarLobe;

  const ronda1 = await Promise.allSettled(
    lobos.map((lobe) =>
      chamarStreamComFallback(lobe, pergunta, null, chamarStream, chamarFallback, options.onToken)
    )
  );

  if (modo === 'paralelo') return { ronda1 };

  const contextoDebate = ronda1
    .filter((r) => r.status === 'fulfilled')
    .map((r) => `[${r.value.nome}]: ${r.value.resposta}`)
    .join('\n\n');

  const ronda2 = await Promise.allSettled(
    lobos.map((lobe) =>
      chamarStreamComFallback(
        lobe,
        pergunta,
        contextoDebate,
        chamarStream,
        chamarFallback,
        options.onToken
      )
    )
  );

  return { ronda1, ronda2 };
}
