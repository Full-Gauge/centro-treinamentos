import test from "node:test";
import assert from "node:assert/strict";
import { handleRegisterRequest } from "../../worker/worker-register.js";

test("register aceita parceiro e PF com token sem reserva, mas exige referência para inscrição paga", async () => {
  const originalFetch = globalThis.fetch;
  const forwarded = [];
  globalThis.fetch = async (_url, options) => {
    forwarded.push(JSON.parse(options.body));
    assert.equal(options.headers["x-api-key"], "test-api-key");
    return Response.json({ success: true });
  };
  try {
    const env = { url_registro: "https://flow.test/register", API_KEY: "test-api-key", PAYMENTS_DB: {} };
    for (const payload of [
      { relacao: "TOKEN", tipoPessoa: "PF", token: "TOKEN-TEST" },
      { relacao: "PARCEIRO", tipoPessoa: "PARCEIRO" }
    ]) {
      const response = await handleRegisterRequest(new Request("https://app.test/api/register", {
        method: "POST", body: JSON.stringify(payload)
      }), env);
      assert.equal(response.status, 200);
      assert.deepEqual(forwarded.at(-1), payload);
    }
    for (const payload of [
      { relacao: "GERAL", tipoPessoa: "PF" },
      { relacao: "GERAL", tipoPessoa: "PJ" },
      { relacao: "TOKEN", tipoPessoa: "PF", token: " " },
      { relacao: "TOKEN", tipoPessoa: "PJ", token: "TOKEN-TEST" }
    ]) {
      const response = await handleRegisterRequest(new Request("https://app.test/api/register", {
        method: "POST", body: JSON.stringify(payload)
      }), env);
      assert.equal(response.status, 400);
    }
    assert.equal(forwarded.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
