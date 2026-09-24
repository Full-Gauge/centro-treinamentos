import test from "node:test";
import assert from "node:assert/strict";
import { markPaymentOrderPaid, updatePaymentOrder } from "../../worker/payment-orders.js";

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
          return { run: async () => ({ success: true }) };
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
