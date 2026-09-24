import test from "node:test";
import assert from "node:assert/strict";
import { handleAdminOrdersRequest } from "../../worker/worker-admin.js";

test("admin orders exige token de acesso", async () => {
  const request = new Request("https://example.com/api/admin/orders");
  const response = await handleAdminOrdersRequest(request, {
    ADMIN_ACCESS_TOKEN: "dev-token",
    PAYMENTS_DB: {}
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Não autorizado" });
});
