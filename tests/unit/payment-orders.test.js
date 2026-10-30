import test from "node:test";
import assert from "node:assert/strict";
import { markPaymentOrderPaid, updatePaymentOrder } from "../../worker/payment-orders.js";
import { buildIpagCustomer, getPaymentAmount } from "../../worker/worker-ipag.js";
import { taxSimulation } from "../fixtures/impostos.js";
import { buildPaymentLinkCreatedPayload } from "../../worker/power-automate.js";

test("buildIpagCustomer envia o endereco para o link e para o checkout", () => {
  const address = {
    street: "Rua dos Testes",
    number: "100",
    district: "Centro",
    complement: "Sala 2",
    city: "Canoas",
    state: "RS",
    country: "BR",
    zipcode: "92010000"
  };

  const customer = buildIpagCustomer({
    name: "Pessoa Teste",
    businessName: "",
    taxReceipt: "95686323011",
    email: "teste@example.com",
    phone: "51988887777",
    personType: "PF",
    billingAddress: address
  });

  assert.deepEqual(customer.address, address);
  assert.deepEqual(customer.billing_address, address);
});

test("getPaymentAmount usa o líquido da simulação para PF, PJ e Canoas", () => {
  const simulation = taxSimulation();
  assert.equal(getPaymentAmount({ tipoPessoa: "PF", vagasDesejadas: "9" }, simulation), "1200.00");
  assert.equal(getPaymentAmount({ tipoPessoa: "PJ", vagasDesejadas: "3" }, simulation), "3378.60");
  const canoas = { tipoPessoa: "PJ", vagasDesejadas: "2", cidadeCobranca: " Canoas ", estadoCobranca: "rs", paisCobranca: "BR" };
  assert.equal(getPaymentAmount(canoas, simulation), "2180.40");
  assert.equal(getPaymentAmount({ ...canoas, estadoCobranca: "SP" }, simulation), "2252.40");
  assert.equal(getPaymentAmount({ ...canoas, paisCobranca: "US" }, simulation), "2252.40");
  simulation.quantidade = 2;
  assert.equal(getPaymentAmount(canoas, simulation), "1090.20");
  assert.equal(getPaymentAmount({ ...canoas, vagasDesejadas: "0" }, simulation), null);
  assert.equal(getPaymentAmount({ ...canoas, vagasDesejadas: "1.5" }, simulation), null);
  assert.equal(getPaymentAmount({ ...canoas, vagasDesejadas: Number.MAX_SAFE_INTEGER }, simulation), null);
  assert.equal(getPaymentAmount(canoas, { ...simulation, moeda: "USD" }), null);
  assert.equal(getPaymentAmount(canoas, { ...simulation, cenarios: [] }), null);
  assert.equal(getPaymentAmount(canoas, { ...simulation, quantidade: 0 }), null);
});

test("monta evento de link criado com idempotência local", () => {
  const payload = buildPaymentLinkCreatedPayload({
    paymentReference: "FG-001",
    link: "https://pay.test/001",
    uuid: "IPAG-001",
    name: "Pessoa Teste",
    email: "teste@example.com",
    amount: "2000.00",
    classId: "TURMA-001",
    desiredSlots: "2"
  });

  assert.equal(payload.event, "payment_link.created");
  assert.equal(payload.event_id, "payment_link.created:FG-001");
  assert.equal(payload.amount, 2000);
  assert.equal(payload.desired_slots, 2);
});

function createDatabaseSpy() {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      const call = { sql, values: [] };
      calls.push(call);
      return {
        bind(...values) {
          call.values = values;
          return { run: async () => ({ success: true, meta: { changes: 1 } }) };
        }
      };
    }
  };
}

test("updatePaymentOrder não executa query quando não há campos", async () => {
  const db = createDatabaseSpy();

  await updatePaymentOrder({ PAYMENTS_DB: db }, "PAY-001", {});

  assert.equal(db.calls.length, 0);
});

test("markPaymentOrderPaid atualiza a reserva pela referência do link", async () => {
  const db = createDatabaseSpy();

  await markPaymentOrderPaid(
    { PAYMENTS_DB: db },
    {
      paymentLinkExternalCode: "LINK-001",
      transactionUuid: "TX-001",
      orderId: "ORDER-001"
    }
  );

  assert.equal(db.calls.length, 1);
  assert.match(db.calls[0].sql, /UPDATE payment_orders/);
  assert.deepEqual(db.calls[0].values.slice(0, 3), ["paid", "TX-001", "ORDER-001"]);
  assert.equal(db.calls[0].values.at(-1), "LINK-001");
});
