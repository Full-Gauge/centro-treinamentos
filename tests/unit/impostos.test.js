import test from "node:test";
import assert from "node:assert/strict";
import { handleImpostosRequest } from "../../worker/worker-impostos.js";
import { taxSimulation } from "../fixtures/impostos.js";

const env = { url_impostos: "https://flow.test/taxes?sig=test", POWER_AUTOMATE_WEBHOOK_TOKEN: "test-token" };
const request = () => new Request("https://app.test/api/impostos?cursoId=TURMA-001&dataCalculo=2000-01-01");

test("impostos usa turma, data atual de São Paulo e token do webhook somente no upstream", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-30T01:30:00Z") });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.searchParams.has("cursoId"), false);
    assert.equal(url.searchParams.has("dataCalculo"), false);
    assert.deepEqual(JSON.parse(options.body), { cursoId: "TURMA-001", dataCalculo: "2026-10-29" });
    assert.equal(url.searchParams.get("sig"), "test");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers["x-ct-webhook-token"], "test-token");
    assert.equal(options.redirect, "manual");
    return Response.json(taxSimulation());
  });
  const response = await handleImpostosRequest(request(), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), taxSimulation());
});

test("impostos rejeita método, curso ou configuração ausente sem chamar o fluxo", async (t) => {
  t.mock.method(globalThis, "fetch", () => assert.fail("não deve consultar upstream"));
  assert.equal((await handleImpostosRequest(new Request("https://app.test/api/impostos", { method: "POST" }), env)).status, 405);
  for (const cursoId of ["", " ", "a".repeat(21)]) {
    assert.equal((await handleImpostosRequest(new Request(`https://app.test/api/impostos?cursoId=${encodeURIComponent(cursoId)}`), env)).status, 400);
  }
  for (const config of [{}, { url_impostos: env.url_impostos }, { POWER_AUTOMATE_WEBHOOK_TOKEN: "test" }]) {
    assert.equal((await handleImpostosRequest(request(), config)).status, 500);
  }
});

test("impostos rejeita erro, JSON inválido e contrato incorreto sem expor URL ou credencial", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-29T12:00:00Z") });
  for (const upstream of [
    () => new Response("secret upstream error", { status: 401 }),
    () => Response.json({ error: { code: "TriggerInputSchemaMismatch", message: "secret upstream error" } }, { status: 400 }),
    () => new Response(null, { status: 302, headers: { Location: "https://other.test/" } }),
    () => new Response("not json"),
    () => Response.json({ ...taxSimulation(), cursoId: "outro" }),
    () => Response.json({ ...taxSimulation(), cenarios: [] }),
    () => { const data = taxSimulation(); data.cenarios[0].valorCurso = "1200"; return Response.json(data); },
    () => { const data = taxSimulation(); data.cenarios[0].impostos[0].valor = null; return Response.json(data); },
    () => { throw new Error("https://flow.test/taxes?sig=secret"); }
  ]) {
    const mock = t.mock.method(globalThis, "fetch", upstream);
    const response = await handleImpostosRequest(request(), env);
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.match(body.code, /^tax_(upstream_http|invalid_json|invalid_response|fetch_failed)$/);
    if (body.code === "tax_upstream_http") assert.ok([401, 400, 302].includes(body.upstreamStatus));
    if (body.upstreamStatus === 400) assert.equal(body.upstreamCode, "TriggerInputSchemaMismatch");
    assert.doesNotMatch(JSON.stringify(body), /sig=|test-token|upstream error/);
    mock.mock.restore();
  }
});
