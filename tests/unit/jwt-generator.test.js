import test from "node:test";
import assert from "node:assert/strict";
import { decodeJwt } from "jose";
import { handleJwtGenerationRequest } from "../../worker/worker-jwt-generator.js";

test("gera JWT de presença sem exigir nem incluir modules", async () => {
  const response = await handleJwtGenerationRequest(
    new Request("https://example.test/api/generate-jwt-register-attendance", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": "api-key" },
      body: JSON.stringify({ classId: "TURMA-001", email: "teste@example.com" })
    }),
    { JWT_SECRET: "jwt-secret", API_KEY: "api-key" }
  );

  assert.equal(response.status, 200);
  assert.equal(decodeJwt((await response.json()).token).modules, undefined);
});
