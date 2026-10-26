import test from "node:test";
import assert from "node:assert/strict";
import worker from "../../src/index.js";

test("rotas de token usam secrets distintos e PJ não usa fallback", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return Response.json({ data: true });
  };
  const env = { url_token: "https://flow.test/partner", url_token_pj: "https://flow.test/pj", API_KEY: "test-key" };
  const request = (route, token = "TEST-TOKEN", method = "POST") => new Request(`https://app.test/api/${route}`, {
    method, ...(method === "POST" ? { body: JSON.stringify({ token }) } : {})
  });
  try {
    for (const [route, target] of [["validate-token", env.url_token], ["validate-token-pj", env.url_token_pj]]) {
      const response = await worker.fetch(request(route), env);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { data: true });
      assert.equal(calls.at(-1).url, target);
      assert.deepEqual(JSON.parse(calls.at(-1).options.body), { token: "TEST-TOKEN" });
    }
    assert.equal(new Headers(calls[1].options.headers).get("x-api-key"), "test-key");
    assert.equal((await worker.fetch(request("validate-token-pj"), { ...env, url_token_pj: undefined })).status, 500);
    assert.equal((await worker.fetch(request("validate-token-pj"), { ...env, API_KEY: undefined })).status, 500);
    assert.equal((await worker.fetch(request("validate-token-pj", " "), env)).status, 400);
    assert.equal((await worker.fetch(request("validate-token-pj", null, "GET"), env)).status, 405);
    assert.equal(calls.length, 2);
    globalThis.fetch = async () => Response.json({ data: false }, { status: 422 });
    const invalid = await worker.fetch(request("validate-token-pj"), env);
    assert.equal(invalid.status, 422);
    assert.deepEqual(await invalid.json(), { data: false });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
