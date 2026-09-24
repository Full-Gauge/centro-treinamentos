import test from "node:test";
import assert from "node:assert/strict";
import { markPaymentOrderPaid, updatePaymentOrder } from "../../worker/payment-orders.js";
import { buildIpagCustomer, getPaymentAmount } from "../../worker/worker-ipag.js";

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

test("getPaymentAmount calcula o total da PJ pelo número de vagas", () => {
  assert.equal(getPaymentAmount({ tipoPessoa: "PJ", vagasDesejadas: "3" }), "3000.00");
  assert.equal(getPaymentAmount({ tipoPessoa: "PF", vagasDesejadas: "9" }), "1000.00");
  assert.equal(getPaymentAmount({ tipoPessoa: "PJ", vagasDesejadas: "0" }), null);
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
