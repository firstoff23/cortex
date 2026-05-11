import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import handler from "./chat.js";
import {
  detectarTipoPergunta,
  getJuizesParaPergunta,
} from "../src/utils/orchestrator.js";
import { runGraders } from "../src/utils/graders.js";
import { calcularConsensoMatematico } from "../src/api/judges.js";
import { calcularConfiancaFinal } from "../src/api/king.js";

function createResponse() {
  return {
    statusCode: undefined,
    body: undefined,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

test("chat handler rejects non-string model values before calling upstream", async () => {
  const previousKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = "test-key";

  const req = {
    method: "POST",
    headers: { origin: "https://example.test" },
    body: { model: { id: "bad" }, messages: [] },
  };
  const res = createResponse();

  try {
    await handler(req, res);
  } finally {
    if (previousKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = previousKey;
    }
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Campos obrigatórios: model, messages" });
});

test("chat handler rejects blank model values", async () => {
  const req = {
    method: "POST",
    headers: {},
    body: { model: "   ", messages: [] },
  };
  const res = createResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Campos obrigatórios: model, messages" });
});

test("chat handler routes every model through OpenRouter only", async () => {
  const previousKey = process.env.OPENROUTER_API_KEY;
  const previousFetch = global.fetch;
  process.env.OPENROUTER_API_KEY = "openrouter-test-key";

  let requestedUrl = "";
  let requestedBody = {};
  global.fetch = async (url, options) => {
    requestedUrl = url;
    requestedBody = JSON.parse(options.body);
    assert.equal(options.headers.Authorization, "Bearer openrouter-test-key");
    assert.equal(options.headers["x-api-key"], undefined);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        model: "google/gemma-3-27b-it:free",
        choices: [{ message: { content: "veredicto gratuito" } }],
      }),
    };
  };

  const req = {
    method: "POST",
    headers: {},
    body: {
      model: "anthropic/claude-3-5-haiku",
      system: "Sistema",
      messages: [{ role: "user", content: "Olá" }],
      max_tokens: 123,
    },
  };
  const res = createResponse();

  try {
    await handler(req, res);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = previousKey;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(requestedUrl, "https://openrouter.ai/api/v1/chat/completions");
  assert.equal(requestedBody.model, "anthropic/claude-3-5-haiku");
  assert.equal(requestedBody.max_tokens, 123);
  assert.deepEqual(res.body, {
    content: "veredicto gratuito",
    model: "google/gemma-3-27b-it:free",
    provider: "openrouter",
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  });
});

test("chat proxy contains no Anthropic-specific routing code", () => {
  const source = readFileSync(new URL("./chat.js", import.meta.url), "utf8");

  assert.equal(/chamarAnthropic|lerAnthropicKey|ANTHROPIC_URL|ANTHROPIC_KEY/.test(source), false);
  assert.equal(/model\.startsWith\("anthropic\/"\)/.test(source), false);
});

test("orchestrator selects dynamic judges by question type", () => {
  assert.equal(detectarTipoPergunta("Implementa uma função com bug em JavaScript"), "codigo");
  assert.deepEqual(getJuizesParaPergunta("Implementa uma função com bug em JavaScript"), [
    "tecnico",
    "relevancia",
    "historico",
  ]);

  assert.equal(detectarTipoPergunta("Quem descobriu o rádio?"), "factual");
  assert.deepEqual(getJuizesParaPergunta("Quem descobriu o rádio?"), [
    "factual",
    "coerencia",
    "historico",
  ]);
});

test("graders calculate objective pass flag", () => {
  const graders = runGraders({
    veredicto: "Uso [Analista Crítico] e [Juiz Factual].",
    confianca_final: 82,
    suggestions: ["A", "B", "C"],
    raciocinio: ["passo"],
    admite_incerteza: false,
  });

  assert.deepEqual(graders, {
    tem_citacoes_inline: true,
    tem_score_confianca: true,
    tem_sugestoes: true,
    tem_raciocinio: true,
    admite_incerteza_quando_deve: true,
    passou_todos: true,
  });
});

test("mathematical consensus uses cosine similarity over lobe text", () => {
  const consenso = calcularConsensoMatematico([
    { result: "React hooks estado local memória conselho" },
    { result: "React hooks estado local memória conselho" },
  ]);

  assert.equal(consenso, 1);
});

test("final confidence combines lobe and judge layers with divergence penalty", () => {
  assert.equal(calcularConfiancaFinal(0.8, 0.9, 0.1), 87);
  assert.equal(calcularConfiancaFinal(0.1, 0.8, 0.7), 44);
});

test("React lists use composite keys for judges, lobes and king text", () => {
  const kingCard = readFileSync(new URL("../src/components/KingCard.jsx", import.meta.url), "utf8");
  const judgeCard = readFileSync(new URL("../src/components/JudgeCard.jsx", import.meta.url), "utf8");
  const cortex = readFileSync(new URL("../src/cortex-digital.jsx", import.meta.url), "utf8");
  const useCouncil = readFileSync(new URL("../src/hooks/useCouncil.js", import.meta.url), "utf8");

  assert.match(kingCard, /key=\{`judge-\$\{judge\.juiz\}-\$\{judge\.nome\}`\}/);
  assert.doesNotMatch(kingCard, /key=\{judge\.juiz \|\| judge\.nome\}/);
  assert.doesNotMatch(kingCard, /key=\{idx\}/);
  assert.match(kingCard, /key=\{`suggestion-\$\{idx\}-\$\{item\.slice\(0, 10\)\}`\}/);

  assert.doesNotMatch(judgeCard, /key=\{idx\}/);
  assert.doesNotMatch(cortex, /key=\{l\.id\}/);
  assert.match(useCouncil, /item\.juiz === next\.juiz/);
});

test("Cortex uses i18n hook and locale strings from integration guide", () => {
  const useI18nSource = readFileSync(new URL("../src/hooks/useI18n.js", import.meta.url), "utf8");
  const cortex = readFileSync(new URL("../src/cortex-digital.jsx", import.meta.url), "utf8");

  assert.match(useI18nSource, /import pt from "\.\.\/i18n\/pt\.js";/);
  assert.match(useI18nSource, /import en from "\.\.\/i18n\/en\.js";/);
  assert.doesNotMatch(cortex, /INTEGRATION/);

  assert.match(cortex, /import \{ useI18n \} from "\.\/hooks\/useI18n\.js";/);
  assert.match(cortex, /const \{ t, lang, toggleLang, speechLang \} = useI18n\(\);/);
  assert.match(cortex, /placeholder=\{t\.chat\.placeholder\}/);
  assert.match(cortex, /sr\.lang=speechLang/);
  assert.match(cortex, /toast\(t\.toasts\.regenerating,"info"\)/);
  assert.match(cortex, /toast\(t\.toasts\.voiceUnsupported,"error"\)/);
  assert.match(cortex, /label:t\.fab\.items\.memory/);
  assert.match(cortex, /\{lang === "pt" \? "EN" : "PT"\}/);
});
