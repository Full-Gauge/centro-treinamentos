import test from "node:test";
import assert from "node:assert/strict";
import { handlePaymentLinkRequest } from "../../worker/worker-ipag.js";
import { taxSimulation } from "../fixtures/impostos.js";

test("iPag consulta preço no servidor e recusa valor divergente antes de criar reserva ou link", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-30T12:00:00Z") });
  let ipagCalls = 0;
  let writes = 0;
  let unavailable = false;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("siteverify")) return Response.json({ success: true, action: "payment-link", hostname: "app.test" });
    if (String(url).startsWith("https://flow.test/")) {
      assert.deepEqual(JSON.parse(options.body), { cursoId: "TREIN-0001", dataCalculo: "2026-10-30" });
      if (unavailable) return new Response(null, { status: 503 });
      return Response.json(taxSimulation("TREIN-0001", "2026-10-30"));
    }
    assert.equal(String(url), "https://sandbox.ipag.com.br/service/v2/payment_links");
    ipagCalls++;
    assert.equal(JSON.parse(options.body).amount, "1200.00");
    return Response.json({ attributes: { amount: "1200.00" }, links: { payment: "https://pay.test/link" } });
  });
  const env = {
    IPAG_API_ID: "test", IPAG_API_KEY: "test", TURNSTILE_SECRET_KEY: "test",
    url_impostos: "https://flow.test/taxes", POWER_AUTOMATE_WEBHOOK_TOKEN: "test",
    PAYMENTS_DB: { prepare: () => ({ bind: () => ({ run: async () => { writes++; return {}; } }) }) }
  };
  const body = {
    tipoPessoa: "PF", name: "Teste", cpfCnpj: "test", email: "test@example.com", phone: "51999999999",
    enderecoCobranca: "Rua Teste", numeroEnderecoCobranca: "1", bairroCobranca: "Centro",
    cidadeCobranca: "Canoas", estadoCobranca: "RS", paisCobranca: "BR", cepCobranca: "92010000",
    turnstileToken: "test", amount: "0.01"
  };
  const request = (expectedAmount) => new Request("https://app.test/api/payment-link", {
    method: "POST", body: JSON.stringify({ ...body, expectedAmount })
  });
  for (const expectedAmount of [1, 1000, undefined, "1200"]) {
    assert.equal((await handlePaymentLinkRequest(request(expectedAmount), env)).status, 409);
  }
  assert.equal(ipagCalls, 0);
  assert.equal(writes, 0);
  unavailable = true;
  assert.equal((await handlePaymentLinkRequest(request(1200), env)).status, 502);
  assert.equal(ipagCalls, 0);
  assert.equal(writes, 0);
  unavailable = false;
  const response = await handlePaymentLinkRequest(request(1200), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).amount, "1200.00");
  assert.equal(ipagCalls, 1);
  assert.equal(writes, 2);
});
