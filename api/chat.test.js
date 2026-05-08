import test from "node:test";
import assert from "node:assert/strict";

import handler from "./chat.js";

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
