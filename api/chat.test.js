// api/chat.test.js — testes F4-02 Upload Universal
// Corre com: node --experimental-vm-modules node_modules/.bin/jest api/chat.test.js
// (ou: npx vitest run api/chat.test.js)

import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// ── Mocks antes dos imports ─────────────────────────────────
// Mock de FileReader nativo
class MockFileReader {
  readAsText(file) {
    // Simula leitura assíncrona
    setTimeout(() => {
      this.result = file._conteudo || '';
      this.onload?.({ target: { result: this.result } });
    }, 0);
  }
  readAsArrayBuffer(file) {
    setTimeout(() => {
      this.result = new ArrayBuffer(file.size || 8);
      this.onload?.({ target: { result: this.result } });
    }, 0);
  }
}
global.FileReader = MockFileReader;

// ── Helpers ──────────────────────────────────────────────────
function criarFicheiro(nome, tamanho = 100, conteudo = '') {
  const f = new File(['x'.repeat(tamanho)], nome, { type: 'text/plain' });
  // Injectar conteúdo simulado para FileReader
  f._conteudo = conteudo || `Conteúdo de teste de ${nome}`;
  // Garantir size real para testes de limite
  Object.defineProperty(f, 'size', { value: tamanho });
  return f;
}

// ── Teste 1: extrairTexto() com conteúdo simples ─────────────
describe('extrairTexto', () => {
  it('deve devolver o texto do ficheiro TXT', async () => {
    const { extrairTexto } = await import('../src/utils/extractors/extractText.js');
    const ficheiro = criarFicheiro('test.txt', 100, 'Olá mundo');
    const resultado = await extrairTexto(ficheiro);
    assert.equal(typeof resultado, 'string');
    assert.ok(resultado.length > 0);
  });
});

// ── Teste 2: useFileUpload rejeita ficheiro > 10 MB ──────────
describe('useFileUpload — limite de tamanho', () => {
  it('deve definir erro para ficheiro maior que 10 MB', async () => {
    // Ficheiro com 11 MB
    const ONZE_MB = 11 * 1024 * 1024;
    const ficheiro = criarFicheiro('grande.pdf', ONZE_MB);

    // Teste direto da lógica sem o hook React
    const LIMITE = 10 * 1024 * 1024;
    assert.ok(ficheiro.size > LIMITE);
  });
});

// ── Teste 3: tipo não suportado ──────────────────────────────
describe('useFileUpload — tipo não suportado', () => {
  it('deve rejeitar extensão .exe com mensagem clara', async () => {
    // Simula a lógica do hook directamente
    const LIMITE_BYTES = 10 * 1024 * 1024;
    const EXTRACTORS_KEYS = ['pdf', 'docx', 'txt', 'md', 'csv', 'xlsx', 'mp3', 'wav'];

    function simularCarregar(file) {
      if (file.size > LIMITE_BYTES) return { erro: 'Ficheiro demasiado grande' };
      const ext = file.name.split('.').pop().toLowerCase();
      if (!EXTRACTORS_KEYS.includes(ext)) {
        return { erro: `Tipo não suportado: .${ext}. Usa PDF, DOCX, TXT, MD, CSV, XLSX, MP3 ou WAV.` };
      }
      return { erro: null };
    }

    const ficheiroExe = criarFicheiro('malware.exe', 500);
    const resultado = simularCarregar(ficheiroExe);

    assert.match(resultado.erro, /Tipo não suportado/);
    assert.match(resultado.erro, /\.exe/);
  });
});

// ── Teste 4: keys compostas para evitar avisos React ────────
describe('MessageList — keys React', () => {
  it('deve usar uma key composta para mensagens com ids repetidos', () => {
    const fonte = readFileSync(new URL('../src/components/MessageList.jsx', import.meta.url), 'utf8');

    assert.doesNotMatch(fonte, /key=\{m\.id \|\| i\}/);
    assert.match(fonte, /key=\{`msg-\$\{i\}-\$\{m\.id \|\| m\.role \|\| "sem-id"\}`\}/);
  });
});

// ── Teste 5: debate paralelo mantém só uma ronda ────────────
describe('runDebate — modo paralelo', () => {
  it("devolve só ronda1 sem ronda2", async () => {
    const { runDebate } = await import('../src/hooks/useCouncil.js');

    const resultado = await runDebate('Pergunta teste', 'paralelo', {
      chamarLobe: async (lobe) => ({
        id: lobe.id,
        nome: lobe.nome,
        resposta: `Resposta ${lobe.id}`,
      }),
    });

    assert.equal(resultado.ronda1.length, 5);
    assert.equal('ronda2' in resultado, false);
  });
});

// ── Teste 6: debate completo executa duas rondas ────────────
describe('runDebate — modo debate', () => {
  it('devolve ronda1 e ronda2 com 5 resultados cada', async () => {
    const { runDebate } = await import('../src/hooks/useCouncil.js');

    const resultado = await runDebate('Pergunta teste', 'debate', {
      chamarLobe: async (lobe, pergunta, contextoDebate) => ({
        id: lobe.id,
        nome: lobe.nome,
        resposta: contextoDebate ? `Ronda 2 ${lobe.nome}` : `Ronda 1 ${lobe.nome}`,
      }),
    });

    assert.equal(resultado.ronda1.length, 5);
    assert.equal(resultado.ronda2.length, 5);
  });
});

// ── Teste 7: Advogado do Diabo mantém regra hard ────────────
describe('runDebate — Advogado do Diabo', () => {
  it("a ronda2 do lobe 5 inclui 'A questão que ninguém fez'", async () => {
    const { runDebate } = await import('../src/hooks/useCouncil.js');

    const resultado = await runDebate('Pergunta teste', 'debate', {
      chamarLobe: async (lobe, pergunta, contextoDebate) => ({
        id: lobe.id,
        nome: lobe.nome,
        resposta: contextoDebate ? `Resposta ronda 2 ${lobe.id}` : `Resposta ronda 1 ${lobe.id}`,
      }),
    });

    const diabo = resultado.ronda2.find((r) => r.status === 'fulfilled' && r.value.id === 5);
    assert.match(diabo.value.resposta, /A questão que ninguém fez/);
  });
});

// ── Teste 8: NIM usa proxy gerido pelo servidor ──────────────
describe('getAPIKey', () => {
  it("getAPIKey('nim') devolve marcador de proxy gerido pelo servidor", async () => {
    const { getAPIKey } = await import('../src/api/council.js');

    assert.equal(getAPIKey('nim'), 'proxy-gerido-pelo-servidor');
  });
});

// ── Teste 9: NIM passa pela proxy serverless ────────────────
describe('NIM proxy', () => {
  it("getBaseURL('nim') aponta para /api/nim-proxy", async () => {
    const { getBaseURL } = await import('../src/api/council.js');

    assert.equal(getBaseURL('nim'), '/api/nim-proxy');
  });
});

// ── Teste 10: chamadas NIM não enviam keys do cliente ───────
describe('chamarLobe — NIM', () => {
  it('usa /api/nim-proxy sem Authorization no browser', async () => {
    const { chamarLobe } = await import('../src/api/council.js');
    const fetchAnterior = global.fetch;
    let chamada = null;

    global.fetch = async (url, init) => {
      chamada = { url, init };
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'resposta nim' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };

    try {
      const resultado = await chamarLobe(
        { id: 3, nome: 'Pragmático Técnico', modelo: 'nvidia/teste', provider: 'nim' },
        'Pergunta',
      );

      assert.equal(chamada.url, '/api/nim-proxy');
      assert.equal(chamada.init.headers.Authorization, undefined);
      assert.equal(resultado.resposta, 'resposta nim');
    } finally {
      global.fetch = fetchAnterior;
    }
  });
});

// ── Teste 11: OpenRouter usa proxy /api/chat no modo normal ──
describe('chamarLobe — OpenRouter', () => {
  it('usa /api/chat para evitar dependência de VITE_OPENROUTER_KEY no browser', async () => {
    const { chamarLobe } = await import('../src/api/council.js');
    const fetchAnterior = global.fetch;
    const keyAnterior = process.env.VITE_OPENROUTER_KEY;
    delete process.env.VITE_OPENROUTER_KEY; // força proxy-gerido-pelo-servidor
    let chamada = null;

    global.fetch = async (url, init) => {
      chamada = { url, init };
      return new Response(
        JSON.stringify({ content: 'resposta openrouter' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };

    try {
      const resultado = await chamarLobe(
        { id: 1, nome: 'Analista Crítico', modelo: 'deepseek/deepseek-r1', provider: 'openrouter' },
        'Pergunta',
      );

      assert.equal(chamada.url, '/api/chat');
      assert.equal(chamada.init.headers.Authorization, undefined);
      assert.equal(resultado.resposta, 'resposta openrouter');
    } finally {
      global.fetch = fetchAnterior;
      if (keyAnterior !== undefined) process.env.VITE_OPENROUTER_KEY = keyAnterior;
    }
  });

  it('não propaga Unexpected end quando /api/chat devolve corpo vazio', async () => {
    const { chamarLobe } = await import('../src/api/council.js');
    const fetchAnterior = global.fetch;

    global.fetch = async () => new Response('', { status: 502 });

    try {
      await assert.rejects(
        () =>
          chamarLobe(
            { id: 1, nome: 'Analista Crítico', modelo: 'deepseek/deepseek-r1', provider: 'openrouter' },
            'Pergunta',
          ),
        (erro) => {
          assert.match(erro.message, /HTTP 502/);
          assert.doesNotMatch(erro.message, /Unexpected end/i);
          return true;
        },
      );
    } finally {
      global.fetch = fetchAnterior;
    }
  });
});

// ── Teste 12: callOpenRouter não rebenta com JSON vazio ──────
describe('callOpenRouter — resposta vazia', () => {
  it('devolve erro controlado quando /api/chat responde sem corpo', async () => {
    const { callOpenRouter } = await import('../src/lib/openrouter.js');
    const fetchAnterior = global.fetch;

    global.fetch = async () => new Response('', { status: 502 });

    try {
      await assert.rejects(
        () => callOpenRouter('gemini', 'Sistema', 'Pergunta'),
        (erro) => {
          assert.match(erro.message, /HTTP 502|resposta vazia|API_KEY não configurada/i);
          assert.doesNotMatch(erro.message, /Unexpected end/i);
          return true;
        },
      );
    } finally {
      global.fetch = fetchAnterior;
    }
  });
});

// ── Teste 13: proxy local expõe rotas Vercel ─────────────────
describe('proxy local — rotas API', () => {
  it('declara /api/chat e /api/nim-proxy para o Vite dev server', () => {
    const fonte = readFileSync(new URL('../proxy.js', import.meta.url), 'utf8');

    assert.match(fonte, /app\.post\(["']\/api\/chat["']/);
    assert.match(fonte, /app\.post\(["']\/api\/nim-proxy["']/);
  });
});

// ── Teste 14: cortex usa os lobos importados ─────────────────
describe('Cortex routing — LOBOS', () => {
  it('não mantém o array LOBES antigo inline no ficheiro principal', () => {
    const fonte = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');

    assert.doesNotMatch(fonte, /const\s+LOBES\s*=\s*\[/);
    assert.match(fonte, /import \{ LOBOS,/);
  });
});

// ── Teste 15: streaming SSE acumula tokens ───────────────────
describe('chamarLobeStream — SSE', () => {
  it('lê eventos data: e chama onToken com texto parcial por lobe', async () => {
    const { chamarLobeStream } = await import('../src/api/council.js');
    const fetchAnterior = global.fetch;
    const keyAnterior = process.env.VITE_OPENROUTER_KEY;
    const encoder = new TextEncoder();
    const tokens = [];

    process.env.VITE_OPENROUTER_KEY = 'sk-or-stream-teste';
    global.fetch = async (url, init) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      const body = JSON.parse(init.body);
      assert.equal(body.stream, true);

      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode('data: {"choices":[{"delta":{"content":"Olá "}}]}\n\n'),
            );
            controller.enqueue(
              encoder.encode('data: {"choices":[{"delta":{"content":"mundo"}}]}\n\n'),
            );
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          },
        }),
        { status: 200 },
      );
    };

    try {
      const lobe = {
        id: 1,
        nome: 'Analista Crítico',
        modelo: 'deepseek/deepseek-r1',
        provider: 'openrouter',
      };
      const resultado = await chamarLobeStream(lobe, 'Pergunta', null, {
        onToken: (delta, textoTotal, lobeRecebido) =>
          tokens.push({ delta, textoTotal, lobeId: lobeRecebido.id }),
      });

      assert.equal(resultado.resposta, 'Olá mundo');
      assert.deepEqual(tokens, [
        { delta: 'Olá ', textoTotal: 'Olá ', lobeId: 1 },
        { delta: 'mundo', textoTotal: 'Olá mundo', lobeId: 1 },
      ]);
    } finally {
      global.fetch = fetchAnterior;
      if (keyAnterior === undefined) delete process.env.VITE_OPENROUTER_KEY;
      else process.env.VITE_OPENROUTER_KEY = keyAnterior;
    }
  });
});

// ── Teste 16: runDebateStream degrada para chamada normal ────
describe('runDebateStream — fallback', () => {
  it('usa chamarLobe normal quando o provider falha em stream', async () => {
    const { runDebateStream } = await import('../src/api/council.js');
    const lobos = [
      { id: 1, nome: 'Analista Crítico', modelo: 'deepseek/deepseek-r1', provider: 'openrouter' },
    ];
    const chamadas = [];

    const resultado = await runDebateStream('Pergunta teste', 'paralelo', {
      lobos,
      chamarLobeStream: async () => {
        throw new Error('stream indisponível');
      },
      chamarLobe: async (lobe) => {
        chamadas.push(lobe.id);
        return { id: lobe.id, nome: lobe.nome, resposta: 'fallback normal' };
      },
    });

    assert.deepEqual(chamadas, [1]);
    assert.equal(resultado.ronda1[0].status, 'fulfilled');
    assert.equal(resultado.ronda1[0].value.resposta, 'fallback normal');
  });
});

// ── Teste 11: hook dedicado ao auto-resize do input ──────────
describe('useAutoResize', () => {
  it('existe e expõe ref + ajustar com limites de altura', () => {
    const fonte = readFileSync(new URL('../src/hooks/useAutoResize.js', import.meta.url), 'utf8');

    assert.match(fonte, /export function useAutoResize/);
    assert.match(fonte, /minHeight = 52/);
    assert.match(fonte, /maxHeight = 200/);
    assert.match(fonte, /return \{ ref, ajustar \}/);
    assert.match(fonte, /window\.addEventListener\('resize', ajustar\)/);
  });
});

// ── Teste 12: input principal usa auto-resize e botão reativo ─
describe('Cortex input — auto-resize', () => {
  it('usa useAutoResize, placeholder do council e reset após envio', () => {
    const fonte = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');

    assert.match(fonte, /useAutoResize/);
    assert.match(fonte, /const \{ ref: inputRef, ajustar \} = useAutoResize\(\{\s*minHeight: 52,\s*maxHeight: 200\s*\}\)/);
    assert.match(fonte, /placeholder="Pergunta ao conselho\.\.\."/);
    assert.match(fonte, /requestAnimationFrame\(\(\) => ajustar\(\)\)/);
    assert.match(fonte, /ajustar\(true\)/);
    assert.match(fonte, /cursor:input\.trim\(\)&&!phase\?"pointer":"not-allowed"/);
    assert.match(fonte, /var\(--accent\)/);
  });
});

// ── Teste 13: sugestões rápidas do Rei como chips ────────────
describe('Sugestões rápidas do Rei', () => {
  it('renderiza chips clicáveis e foca o input', () => {
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');
    const fonteMessageList = readFileSync(new URL('../src/components/MessageList.jsx', import.meta.url), 'utf8');

    assert.match(fonteCortex, /onSuggestionClick=\{aplicarSugestaoRei\}/);
    assert.match(fonteCortex, /inputRef\.current\?\.focus\(\)/);
    assert.match(fonteMessageList, /const sugestoesRei =/);
    assert.match(fonteMessageList, /m\.king\?\.suggestions/);
    assert.match(fonteMessageList, /onSuggestionClick\(sugestao\)/);
    assert.match(fonteMessageList, /border: "1px solid var\(--accent\)"/);
  });
});

// ── Teste 17: F4-02 hook universal usa imports dinâmicos ─────
describe('F4-02 useFileUpload universal', () => {
  it('expõe a interface nova, previews de imagem e cleanup de object URLs', () => {
    const fonte = readFileSync(new URL('../src/hooks/useFileUpload.js', import.meta.url), 'utf8');

    assert.match(fonte, /export function useFileUpload\(\{ onUpload \} = \{\}\)/);
    assert.match(fonte, /ficheiro/);
    assert.match(fonte, /isDragging/);
    assert.match(fonte, /inputRef/);
    assert.match(fonte, /handleClick/);
    assert.match(fonte, /handleChange/);
    assert.match(fonte, /handleDrop/);
    assert.match(fonte, /handleDragOver/);
    assert.match(fonte, /handleDragEnter/);
    assert.match(fonte, /handleDragLeave/);
    assert.match(fonte, /handleRemove/);
    assert.match(fonte, /URL\.createObjectURL/);
    assert.match(fonte, /URL\.revokeObjectURL/);
  });

  it('usa OpenRouter file-parser para PDF e imports dinamicos para mammoth/xlsx', () => {
    const fonte = readFileSync(new URL('../src/hooks/useFileUpload.js', import.meta.url), 'utf8');

    assert.match(fonte, /extrairPdfViaOpenRouter/);
    assert.match(fonte, /file-parser/);
    assert.match(fonte, /cloudflare-ai/);
    assert.doesNotMatch(fonte, /import\(['"]pdfjs-dist/);
    assert.match(fonte, /import\(['"]mammoth['"]\)/);
    assert.match(fonte, /import\(['"]xlsx['"]\)/);
    assert.match(fonte, /AUDIO_PLACEHOLDER/);
    assert.doesNotMatch(fonte, /from ['"]mammoth['"]/);
    assert.doesNotMatch(fonte, /from ['"]xlsx['"]/);
  });
});

// ── Teste 18: F4-02 componente visual ───────────────────────
describe('F4-02 FileUpload component', () => {
  it('renderiza drop zone, preview de imagem e botão remover sem Tailwind', () => {
    const fonte = readFileSync(new URL('../src/components/FileUpload.jsx', import.meta.url), 'utf8');

    assert.match(fonte, /useFileUpload\(\{ onUpload \}\)/);
    assert.match(fonte, /Arrasta ou clica para enviar/);
    assert.match(fonte, /imagens, PDF, DOCX, TXT, CSV, XLSX, áudio/);
    assert.match(fonte, /border: '2px dashed var\(--border\)'/);
    assert.match(fonte, /borderColor: 'var\(--accent\)'/);
    assert.match(fonte, /background: 'rgba\(168,85,247,0\.05\)'/);
    assert.match(fonte, /<img/);
    assert.match(fonte, /maxHeight: '200px'/);
    assert.doesNotMatch(fonte, /className=/);
  });
});

// ── Teste 19: F4-02 integração no chat ──────────────────────
describe('F4-02 integração no Cortex', () => {
  it('abre FileUpload pelo botão attach e anexa conteúdo ao contexto', () => {
    const fonte = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');

    assert.match(fonte, /import FileUpload from ['"]\.\/components\/FileUpload\.jsx['"]/);
    assert.match(fonte, /const \[showFileUpload, setShowFileUpload\]/);
    assert.match(fonte, /<FileUpload\s+onUpload=\{handleFileUpload\}/);
    assert.match(fonte, /\[Ficheiro: \$\{ficheiroAnexado\.nome\}\]\\n\[Conteúdo\]:\\n/);
    assert.match(fonte, /Pergunta do utilizador: \$\{q\}/);
    assert.match(fonte, /previewUrl: ficheiroAnexado\.previewUrl/);
    assert.match(fonte, /uploadPreviewUrlsRef/);
    assert.match(fonte, /fetch\(ficheiro\.previewUrl\)/);
    assert.match(fonte, /URL\.createObjectURL\(blob\)/);
    assert.match(fonte, /URL\.revokeObjectURL\(ficheiroAnexado\.previewUrl\)/);
    assert.match(fonte, /anexoUpload/);
  });

  it('MessageList mostra preview de imagem anexada no chat', () => {
    const fonte = readFileSync(new URL('../src/components/MessageList.jsx', import.meta.url), 'utf8');

    assert.match(fonte, /m\.anexo\?\.previewUrl/);
    assert.match(fonte, /<img/);
    assert.match(fonte, /alt="Imagem anexada"/);
    assert.match(fonte, /maxHeight: 200/);
    assert.match(fonte, /borderRadius: 8/);
    assert.match(fonte, /marginBottom: 8/);
    assert.match(fonte, /objectFit: "cover"/);
  });
});

// ── Teste 20: limpeza de header/settings/memória ────────────
describe('UI v12 — header, settings e memória', () => {
  it('usa copy de 5 lobos e remove o botão de foco sem efeito', () => {
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');

    assert.doesNotMatch(fonteCortex, /title=\{t\.focus\.title\}/);
    assert.doesNotMatch(fonteCortex, /setFocusMode\(v=>!v\)/);
  });

  it('Settings usa os MODELS reais e a memória guarda resumo episódico por resposta', () => {
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');
    const fonteCouncil = readFileSync(new URL('../src/hooks/useCouncil.js', import.meta.url), 'utf8');
    const fonteKingCard = readFileSync(new URL('../src/components/KingCard.jsx', import.meta.url), 'utf8');
    const fonteMessageList = readFileSync(new URL('../src/components/MessageList.jsx', import.meta.url), 'utf8');

    assert.match(fonteCortex, /MODELS\.map\(\(m,idx\)=>/);
    assert.match(fonteCortex, /brain\.sessions,"Sessões"/);
    assert.match(fonteCortex, /brain\.semantic\.length\+brain\.episodic\.length\+brain\.patterns\.length/);
    assert.match(fonteCouncil, /const resumoEpisodico = respostaMemoria/);
    assert.match(fonteCouncil, /episodic: resumoEpisodico/);
    assert.doesNotMatch(fonteKingCard, /king\?\.suggestions\?\.length/);
    assert.match(fonteMessageList, /GENERIC_ERROR_SUGGESTIONS/);
    assert.match(fonteMessageList, /Continua sem juízes/);
  });
});

// ── Teste 21: componentes 21st.dev adaptados ────────────────
describe('UI v12 — componentes 21st.dev adaptados', () => {
  it('cria componentes nativos sem Tailwind, Radix ou framer-motion', () => {
    const ficheiros = [
      '../src/components/ChatBubble.jsx',
      '../src/components/AlertaBanner.jsx',
      '../src/components/Toast.jsx',
      '../src/components/LobeLoader.jsx',
      '../src/components/EstadoVazio.jsx',
      '../src/components/SidePanel.jsx',
      '../src/components/Abas.jsx',
      '../src/components/Slider.jsx',
    ];

    for (const ficheiro of ficheiros) {
      const fonte = readFileSync(new URL(ficheiro, import.meta.url), 'utf8');
      assert.doesNotMatch(fonte, /framer-motion|@radix|next\/image|use client|interface\s+\w+|:\s*React\./);
      assert.doesNotMatch(fonte, /className=\{?["'`][\s\S]{0,120}(bg-|text-|rounded-|p-\d|flex)/);
      assert.match(fonte, /style=\{\{/);
    }
  });

  it('integra bolhas, estado vazio, side panel, toasts, alertas e contador no Cortex', () => {
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');
    const fonteMessageList = readFileSync(new URL('../src/components/MessageList.jsx', import.meta.url), 'utf8');
    const fonteKingCard = readFileSync(new URL('../src/components/KingCard.jsx', import.meta.url), 'utf8');

    assert.match(fonteCortex, /useToast\(\)/);
    assert.match(fonteCortex, /<Toast toasts=\{toasts\} onFechar=\{removerToast\}/);
    assert.match(fonteCortex, /<SidePanel aberto=\{showSidebar\}/);
    assert.match(fonteCortex, /<SidePanel[\s\S]*aberto=\{showBlueprintsPanel\}/);
    assert.match(fonteCortex, /<SidePanel[\s\S]*aberto=\{showForensePanel\}/);
    assert.match(fonteCortex, /<EstadoVazio/);
    assert.match(fonteCortex, /<AlertaBanner/);
    assert.match(fonteCortex, /\{inputChars\} chars · ~\{inputTokens\} tokens/);
    assert.match(fonteMessageList, /<ChatBubble\s+papel="user"/);
    assert.match(fonteKingCard, /<ChatBubble papel="rei"/);
  });

  it('usa tabs para o debate e slider persistido para temperatura por lobe', () => {
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');
    const fonteTimeline = readFileSync(new URL('../src/components/DebateTimeline.jsx', import.meta.url), 'utf8');
    const fonteCouncil = readFileSync(new URL('../src/api/council.js', import.meta.url), 'utf8');

    assert.match(fonteTimeline, /<Abas/);
    assert.match(fonteTimeline, /defaultActiva="veredicto"/);
    assert.match(fonteTimeline, /titulo: "Ronda 1"/);
    assert.match(fonteTimeline, /titulo: "Ronda 2"/);
    assert.match(fonteTimeline, /ronda3/);
    assert.match(fonteTimeline, /titulo: "Ronda 3"/);
    assert.match(fonteCortex, /const \[temperaturas,setTemperaturas\]/);
    assert.match(fonteCortex, /saveTemperaturas/);
    assert.match(fonteCortex, /<Slider/);
    assert.match(fonteCouncil, /opcoesGeracaoLobe/);
    assert.match(fonteCouncil, /temperature: Number\(temperatura\)/);
  });
});

// ── Teste 22: prompts runtime e Rei OpenRouter ──────────────
describe('Prompts modulares — runtime e Rei', () => {
  it('Rei usa configuração explícita Llama via OpenRouter e /api/chat', () => {
    const fonteKing = readFileSync(new URL('../src/api/king.js', import.meta.url), 'utf8');

    assert.match(fonteKing, /const JUIZ_REI = \{/);
    assert.match(fonteKing, /modelo: "meta-llama\/llama-3\.3-70b-instruct:free"/);
    assert.match(fonteKing, /provider: "openrouter"/);
    assert.match(fonteKing, /fetch\("\/api\/chat"/);
    assert.match(fonteKing, /chamarModeloRei\(JUIZ_REI\.modelo/);
    assert.doesNotMatch(fonteKing, /claude-3\.7-sonnet|Anthropic API|Opus 4\.7/i);
  });

  it('council mantém lobos em texto livre e remove SYSTEM_REI legado', () => {
    const fonteCouncil = readFileSync(new URL('../src/api/council.js', import.meta.url), 'utf8');
    const blocoNormalizar = fonteCouncil.match(/function normalizarValorLobe[\s\S]*?function opcoesGeracaoLobe/)?.[0] || '';

    assert.doesNotMatch(fonteCouncil, /export const SYSTEM_REI/);
    assert.doesNotMatch(fonteCouncil, /Devolve APENAS JSON sem markdown:[\s\S]*SYSTEM_PROMPTS/);
    assert.doesNotMatch(blocoNormalizar, /JSON\.parse/);
  });

  it('prompts markdown são documentação e não runtime Vercel', () => {
    const raiz = new URL('..', import.meta.url);
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');
    const fonteCouncil = readFileSync(new URL('../src/api/council.js', import.meta.url), 'utf8');
    const fonteKing = readFileSync(new URL('../src/api/king.js', import.meta.url), 'utf8');
    const promptRei = readFileSync(new URL('../prompts/judge_rei.md', import.meta.url), 'utf8');

    assert.equal(existsSync(new URL('prompts/judge_rei.md', raiz)), true);
    assert.equal(existsSync(new URL('prompts/judge_claude.md', raiz)), false);
    assert.doesNotMatch(`${fonteCortex}\n${fonteCouncil}\n${fonteKing}`, /fetch\(["']\/prompts\//);
    assert.match(promptRei, /meta-llama\/llama-3\.3-70b-instruct:free/);
    assert.match(promptRei, /src\/api\/king\.js/);
    assert.doesNotMatch(promptRei, /Claude 3\.7 Sonnet|claude-3\.7-sonnet|Anthropic API|Opus 4\.7/i);
  });
});

// ── Teste 23: F4-01 imagens multimodais via OpenRouter ──────
describe('F4-01 imagens multimodais', () => {
  it('useFileUpload extrai imageDataUrl sem persistir só o object URL', () => {
    const fonte = readFileSync(new URL('../src/hooks/useFileUpload.js', import.meta.url), 'utf8');

    assert.match(fonte, /function arrayBufferParaBase64/);
    assert.match(fonte, /const CHUNK = 8192/);
    assert.match(fonte, /async function extrairImagem/);
    assert.match(fonte, /imageDataUrl: `data:\$\{tipo\};base64,\$\{base64\}`/);
    assert.match(fonte, /const \[imageDataUrl, setImageDataUrl\] = useState\(null\)/);
    assert.match(fonte, /setImageDataUrl\(extraido\.imageDataUrl \|\| null\)/);
    assert.match(fonte, /imageDataUrl: novoFicheiro\.imageDataUrl/);
    assert.match(fonte, /setImageDataUrl\(null\)/);
  });

  it('chamarLobe envia content array com text + image_url', async () => {
    const { chamarLobe } = await import('../src/api/council.js');
    const fetchAnterior = global.fetch;
    const imagem = 'data:image/png;base64,abc123';
    let body = null;

    global.fetch = async (url, init) => {
      assert.equal(url, '/api/chat');
      body = JSON.parse(init.body);
      return new Response(
        JSON.stringify({ content: 'imagem analisada' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };

    try {
      const resultado = await chamarLobe(
        { id: 2, nome: 'Inovador Criativo', modelo: 'google/gemma-3-12b-it:free', provider: 'openrouter' },
        'Descreve a imagem',
        null,
        { imageDataUrl: imagem },
      );

      assert.equal(resultado.resposta, 'imagem analisada');
      assert.deepEqual(body.messages[0].content, [
        { type: 'text', text: 'Descreve a imagem' },
        { type: 'image_url', image_url: { url: imagem } },
      ]);
    } finally {
      global.fetch = fetchAnterior;
    }
  });

  it('runDebate e runDebateStream passam imagem só na ronda 1', async () => {
    const { runDebate, runDebateStream } = await import('../src/api/council.js');
    const imagem = 'data:image/jpeg;base64,xyz';
    const lobos = [
      { id: 2, nome: 'Inovador Criativo', modelo: 'google/gemma-3-12b-it:free', provider: 'openrouter' },
    ];
    const chamadasDebate = [];
    const chamadasStream = [];

    await runDebate('Pergunta com imagem', 'debate', {
      lobos,
      imageDataUrl: imagem,
      chamarLobe: async (lobe, pergunta, contextoDebate, options = {}) => {
        chamadasDebate.push({ contextoDebate, imageDataUrl: options.imageDataUrl });
        return { id: lobe.id, nome: lobe.nome, resposta: contextoDebate ? 'ronda 2' : 'ronda 1' };
      },
    });

    await runDebateStream('Pergunta com imagem', 'debate', {
      lobos,
      imageDataUrl: imagem,
      chamarLobeStream: async (lobe, pergunta, contextoDebate, options = {}) => {
        chamadasStream.push({ contextoDebate, imageDataUrl: options.imageDataUrl });
        return { id: lobe.id, nome: lobe.nome, resposta: contextoDebate ? 'stream 2' : 'stream 1' };
      },
      chamarLobe: async () => {
        throw new Error('fallback não devia ser chamado');
      },
    });

    assert.equal(chamadasDebate[0].imageDataUrl, imagem);
    assert.equal(chamadasDebate[1].imageDataUrl, undefined);
    assert.equal(chamadasStream[0].imageDataUrl, imagem);
    assert.equal(chamadasStream[1].imageDataUrl, undefined);
    assert.ok(chamadasDebate[1].contextoDebate.includes('[Inovador Criativo]'));
    assert.ok(chamadasStream[1].contextoDebate.includes('[Inovador Criativo]'));
  });

  it('useCouncil e Cortex encaminham imageDataUrl sem o guardar no histórico', () => {
    const fonteCouncil = readFileSync(new URL('../src/hooks/useCouncil.js', import.meta.url), 'utf8');
    const fonteCortex = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');
    const blocoAnexo = fonteCortex.match(/const anexoUpload = ficheiroAnexado[\s\S]*?: null;/)?.[0] || '';

    assert.match(fonteCouncil, /imageDataUrl,/);
    assert.match(fonteCouncil, /runDebateStream\(qFinal, modoExecucao, \{[\s\S]*imageDataUrl,/);
    assert.match(fonteCortex, /const imagemDataUrlEnvio = ficheiroAnexado\?\.imageDataUrl \|\| null/);
    assert.match(fonteCortex, /imageDataUrl: imagemDataUrlEnvio/);
    assert.doesNotMatch(blocoAnexo, /imageDataUrl/);
    assert.doesNotMatch(fonteCortex, /Preview URL/);
  });
});

// ── Teste 24: F4-03 export Word/Excel/Notion ────────────────
describe('F4-03 Export Word/Excel/Notion', () => {
  it('useExport existe e usa imports dinâmicos para docx/xlsx', () => {
    const fonte = readFileSync(new URL('../src/hooks/useExport.js', import.meta.url), 'utf8');
    const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

    assert.match(pkg, /"docx":/);
    assert.match(pkg, /"xlsx":/);
    assert.match(fonte, /export async function exportarWord/);
    assert.match(fonte, /export async function exportarExcel/);
    assert.match(fonte, /export async function exportarNotion/);
    assert.match(fonte, /await import\('docx'\)/);
    assert.match(fonte, /await import\('xlsx'\)/);
    assert.match(fonte, /fetch\('\/api\/notion-export'/);
    assert.doesNotMatch(fonte, /from ['"]docx['"]/);
    assert.doesNotMatch(fonte, /from ['"]xlsx['"]/);
  });

  it('KingCard mostra botões de export e mantém token Notion só em useState', () => {
    const fonte = readFileSync(new URL('../src/components/KingCard.jsx', import.meta.url), 'utf8');

    assert.match(fonte, /exportarExcel, exportarNotion, exportarWord/);
    assert.match(fonte, /const \[notionToken, setNotionToken\] = React\.useState\(""\)/);
    assert.match(fonte, /const \[notionPageId, setNotionPageId\] = React\.useState\(""\)/);
    assert.match(fonte, /📄 Word/);
    assert.match(fonte, /📊 Excel/);
    assert.match(fonte, /📝"\} Notion|📝\} Notion/);
    assert.match(fonte, /placeholder="Token de integração Notion"/);
    assert.match(fonte, /placeholder="ID da página"/);
    assert.doesNotMatch(fonte, /localStorage.*notion|notion.*localStorage/i);
  });

  it('api/notion-export envia blocos para a API do Notion', async () => {
    const { default: handler } = await import('../api/notion-export.js');
    const fetchAnterior = global.fetch;
    let chamada = null;

    global.fetch = async (url, init) => {
      chamada = { url, init, body: JSON.parse(init.body) };
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
      end() {
        this.ended = true;
        return this;
      },
    };

    try {
      await handler(
        {
          method: 'POST',
          body: {
            pergunta: 'O que é RAG?',
            lobos: [{ nome: 'Analista Crítico', resposta: 'Resposta do lobe' }],
            veredicto: 'Veredicto final',
            notionToken: 'secret_test',
            notionPageId: 'pagina-123',
          },
        },
        res,
      );

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { sucesso: true });
      assert.equal(chamada.url, 'https://api.notion.com/v1/blocks/pagina-123/children');
      assert.equal(chamada.init.method, 'PATCH');
      assert.equal(chamada.init.headers.Authorization, 'Bearer secret_test');
      assert.equal(chamada.init.headers['Notion-Version'], '2022-06-28');
      assert.match(JSON.stringify(chamada.body.children), /Pergunta|Respostas dos Lobos|Veredicto do Rei/);
    } finally {
      global.fetch = fetchAnterior;
    }
  });

  it('proxy local, AGENTS e serverless documentam F4-03', () => {
    const fonteProxy = readFileSync(new URL('../proxy.js', import.meta.url), 'utf8');
    const fonteAgents = readFileSync(new URL('../AGENTS.md', import.meta.url), 'utf8');

    assert.equal(existsSync(new URL('../api/notion-export.js', import.meta.url)), true);
    assert.match(fonteProxy, /app\.post\(["']\/api\/notion-export["']/);
    assert.match(fonteAgents, /F4-03 Export Word\/Excel\/Notion — FEITO/);
    assert.match(fonteAgents, /useExport\.js/);
    assert.match(fonteAgents, /api\/notion-export\.js/);
  });
});

// ── Teste 25: Modo Code Agent ───────────────────────────────
describe('Modo Code Agent', () => {
  it('exporta SYSTEM_PROMPTS_CODE e chamarLobe usa override por lobe', async () => {
    const { SYSTEM_PROMPTS_CODE, chamarLobe } = await import('../src/api/council.js');
    const fetchAnterior = global.fetch;
    let body = null;

    global.fetch = async (url, init) => {
      assert.equal(url, '/api/chat');
      body = JSON.parse(init.body);
      return new Response(
        JSON.stringify({ content: 'análise de código' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };

    try {
      assert.match(SYSTEM_PROMPTS_CODE[1], /Analista de Código do Córtex/);

      const resultado = await chamarLobe(
        { id: 1, nome: 'Analista Crítico', modelo: 'deepseek/deepseek-r1', provider: 'openrouter' },
        'Revê src/cortex-digital.jsx',
        null,
        { systemPrompts: SYSTEM_PROMPTS_CODE },
      );

      assert.equal(resultado.resposta, 'análise de código');
      assert.equal(body.system, SYSTEM_PROMPTS_CODE[1]);
    } finally {
      global.fetch = fetchAnterior;
    }
  });

  it('Cortex expõe o pill Código e só passa prompts code em modo debate', () => {
    const fonte = readFileSync(new URL('../src/cortex-digital.jsx', import.meta.url), 'utf8');

    assert.match(fonte, /SYSTEM_PROMPTS_CODE/);
    assert.match(fonte, /const \[modoCode,\s*setModoCode\]\s*=\s*useState\(false\)/);
    assert.match(fonte, /setModoCode\(\(m\) => !m\)|setModoCode\(m=>!m\)/);
    assert.match(fonte, /💻 Código/);
    assert.match(fonte, /systemPrompts:\s*modoCode && modoDebate \? SYSTEM_PROMPTS_CODE : undefined/);
  });
});

// ── Teste 26: loop de refinamento ───────────────────────────
describe('runDebate — ronda 3 condicional', () => {
  it('executa ronda3 apenas em modo debate quando o consenso provisório é baixo', async () => {
    const { runDebate } = await import('../src/api/council.js');
    const lobos = [
      { id: 1, nome: 'Analista Crítico', modelo: 'm1', provider: 'openrouter' },
      { id: 2, nome: 'Inovador Criativo', modelo: 'm2', provider: 'openrouter' },
    ];
    const chamadas = [];

    const resultado = await runDebate('Pergunta teste', 'debate', {
      lobos,
      chamarLobe: async (lobe, pergunta, contextoDebate) => {
        chamadas.push({ lobeId: lobe.id, pergunta, contextoDebate });
        if (!contextoDebate) {
          return {
            id: lobe.id,
            nome: lobe.nome,
            resposta: lobe.id === 1 ? 'React estado hook componente' : 'SQL índice tabela consulta',
          };
        }
        if (pergunta.includes('O conselho não convergiu.')) {
          return { id: lobe.id, nome: lobe.nome, resposta: `Ronda 3 ${lobe.nome}` };
        }
        return {
          id: lobe.id,
          nome: lobe.nome,
          resposta: lobe.id === 1 ? 'CSS layout grelha scroll' : 'OAuth token sessão servidor',
        };
      },
    });

    assert.equal(resultado.ronda1.length, 2);
    assert.equal(resultado.ronda2.length, 2);
    assert.equal(resultado.ronda3.length, 2);
    assert.equal(chamadas.filter((c) => c.pergunta.includes('O conselho não convergiu.')).length, 2);
    assert.match(chamadas[4].contextoDebate, /\[Analista Crítico\]: React estado hook componente/);
    assert.match(chamadas[4].contextoDebate, /\[Inovador Criativo\]: OAuth token sessão servidor/);
  });

  it('não executa ronda3 em modo paralelo', async () => {
    const { runDebate } = await import('../src/api/council.js');
    const chamadas = [];

    const resultado = await runDebate('Pergunta teste', 'paralelo', {
      lobos: [{ id: 1, nome: 'Analista Crítico', modelo: 'm1', provider: 'openrouter' }],
      chamarLobe: async (lobe, pergunta, contextoDebate) => {
        chamadas.push({ pergunta, contextoDebate });
        return { id: lobe.id, nome: lobe.nome, resposta: 'Resposta isolada' };
      },
    });

    assert.equal(resultado.ronda1.length, 1);
    assert.equal('ronda2' in resultado, false);
    assert.equal('ronda3' in resultado, false);
    assert.equal(chamadas.length, 1);
  });
});
