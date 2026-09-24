import assert from "node:assert/strict";
import test from "node:test";
import {
  isPendingPowerAutomateResponse,
  isTurmasPayload,
  unwrapTurmasPayload
} from "../../worker/workers-turmas.js";

test("reconhece a resposta final de turmas", () => {
  assert.equal(isTurmasPayload({ data: [{ id: "TURMA-001" }] }), true);
  assert.equal(isTurmasPayload({ properties: { response: { status: "Waiting" } } }), false);
});

test("reconhece resposta assíncrona pendente do Power Automate", () => {
  assert.equal(
    isPendingPowerAutomateResponse({ properties: { response: { status: "Waiting" } } }, 200),
    true
  );
  assert.equal(isPendingPowerAutomateResponse({}, 202), true);
  assert.equal(isPendingPowerAutomateResponse({ data: [] }, 200), false);
});

test("desembrulha turmas retornadas dentro do body do Power Automate", () => {
  assert.deepEqual(
    unwrapTurmasPayload({ properties: { response: { body: JSON.stringify({ data: [{ id: "TURMA-001" }] }) } } }),
    { data: [{ id: "TURMA-001" }] }
  );
});
