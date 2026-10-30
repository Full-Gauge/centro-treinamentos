export function getPaymentQuote(body, simulation) {
  if (!["PF", "PJ"].includes(body.tipoPessoa) || simulation?.moeda !== "BRL") return null;
  const slots = body.tipoPessoa === "PJ" ? Number(body.vagasDesejadas) : 1;
  if (!Number.isSafeInteger(slots) || slots < 1 || !Number.isFinite(simulation.quantidade) || simulation.quantidade <= 0) return null;
  const canoas = String(body.cidadeCobranca || "").trim().toUpperCase() === "CANOAS"
    && String(body.estadoCobranca || "").trim().toUpperCase() === "RS"
    && String(body.paisCobranca || "BR").trim().toUpperCase() === "BR";
  const type = body.tipoPessoa === "PF" ? "PF" : canoas ? "PJ_CANOAS" : "PJ";
  const scenario = simulation.cenarios?.find((item) => item.tipo === type);
  if (!Number.isFinite(scenario?.liquidoAPagar) || scenario.liquidoAPagar <= 0) return null;
  const unitCents = Math.round(scenario.liquidoAPagar / simulation.quantidade * 100);
  const totalCents = unitCents * slots;
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) return null;
  return { scenarioType: type, amountPerSlot: unitCents / 100, totalAmount: totalCents / 100 };
}
