import test from "node:test";
import assert from "node:assert/strict";
import {
  getPaymentDetails,
  getPowerAutomatePayload,
  signaturesMatch
} from "../../worker/worker-ipag-payment-confirmed.js";

test("getPaymentDetails normaliza o evento capturado do iPag", () => {
  const details = getPaymentDetails({
    id: "TX-001",
    uuid: "UUID-001",
    resource: "transactions",
    attributes: {
      order_id: "ORDER-001",
      payment_link_external_code: "LINK-001",
      amount: "1000",
      method: "mastercard",
      installments: "3",
      captured_at: "2026-09-17T15:20:37-03:00",
      status: { code: 8, message: "CAPTURED" },
      customer: { name: "Pessoa Teste", email: "teste@example.com" },
      acquirer: { name: "simulated" }
    }
  });

  assert.deepEqual(details, {
    transactionId: "TX-001",
    transactionUuid: "UUID-001",
    orderId: "ORDER-001",
    paymentLinkExternalCode: "LINK-001",
    resource: "transactions",
    statusCode: 8,
    amount: 1000,
    status: "CAPTURED",
    paymentMethod: "mastercard",
    installments: 3,
    capturedAt: "2026-09-17T15:20:37-03:00",
    acquirer: "simulated",
    customerName: "Pessoa Teste",
    customerEmail: "teste@example.com"
  });
});

test("getPowerAutomatePayload envia somente o contrato capturado", () => {
  const payload = getPowerAutomatePayload({
    transactionUuid: "UUID-001",
    customerName: "Pessoa Teste",
    customerEmail: "teste@example.com",
    orderId: "ORDER-001",
    amount: 1000,
    status: "CAPTURED",
    paymentMethod: "pix",
    installments: 1,
    capturedAt: "2026-09-17T15:20:37-03:00",
    acquirer: "simulated"
  });

  assert.deepEqual(Object.keys(payload).sort(), [
    "acquirer",
    "amount",
    "captured_at",
    "email",
    "event",
    "installments",
    "name",
    "order_id",
    "payment_method",
    "status",
    "transaction_uuid"
  ]);
  assert.equal(payload.event, "payment.captured");
  assert.equal(payload.name, "Pessoa Teste");
  assert.equal(payload.email, "teste@example.com");
});

test("signaturesMatch compara HMAC hexadecimal sem aceitar formato inválido", () => {
  const signature = "a".repeat(64);

  assert.equal(signaturesMatch(signature, signature.toUpperCase()), true);
  assert.equal(signaturesMatch(signature, `${"a".repeat(63)}b`), false);
  assert.equal(signaturesMatch(signature, "invalid"), false);
});
