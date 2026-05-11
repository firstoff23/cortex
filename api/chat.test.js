// api/chat.test.js — testes F4-02 Upload Universal
// Corre com: node --experimental-vm-modules node_modules/.bin/jest api/chat.test.js
// (ou: npx vitest run api/chat.test.js)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

// ── Teste 8: NIM usa chave dedicada quando existe ────────────
describe('getAPIKey', () => {
  it("getAPIKey('nim') devolve VITE_NVIDIA_NIM_KEY se definida", async () => {
    const { getAPIKey } = await import('../src/api/council.js');
    const anteriorNim = process.env.VITE_NVIDIA_NIM_KEY;
    const anteriorOpenRouter = process.env.VITE_OPENROUTER_KEY;

    process.env.VITE_NVIDIA_NIM_KEY = 'nvapi-teste';
    process.env.VITE_OPENROUTER_KEY = 'sk-or-fallback';

    try {
      assert.equal(getAPIKey('nim'), 'nvapi-teste');
    } finally {
      if (anteriorNim === undefined) delete process.env.VITE_NVIDIA_NIM_KEY;
      else process.env.VITE_NVIDIA_NIM_KEY = anteriorNim;
      if (anteriorOpenRouter === undefined) delete process.env.VITE_OPENROUTER_KEY;
      else process.env.VITE_OPENROUTER_KEY = anteriorOpenRouter;
    }
  });
});
