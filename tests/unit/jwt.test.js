import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { jsonError, verifyRegistrationToken } from "../../worker/jwt.js";

test("verifyRegistrationToken aceita JWT HS256 assinado com o secret correto", async () => {
  const secret = "unit-test-secret";
  const token = await new SignJWT({ classId: "TURMA-001", email: "teste@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

  const payload = await verifyRegistrationToken(token, { JWT_SECRET: secret });

  assert.equal(payload.classId, "TURMA-001");
  assert.equal(payload.email, "teste@example.com");
});

test("verifyRegistrationToken rejeita secret incorreto e token inválido", async () => {
  assert.equal(
    await verifyRegistrationToken("not-a-jwt", { JWT_SECRET: "unit-test-secret" }),
    null
  );
  assert.equal(
    await verifyRegistrationToken("not-a-jwt", { JWT_SECRET: "wrong-secret" }),
    null
  );
});

test("jsonError retorna JSON e status informados", async () => {
  const response = jsonError("Falha de validação", 422);

  assert.equal(response.status, 422);
  assert.equal(response.headers.get("Content-Type"), "application/json");
  assert.deepEqual(await response.json(), { error: "Falha de validação" });
});
