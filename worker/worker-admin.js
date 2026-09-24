function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function isAuthorized(request, env) {
  const expected = String(env.ADMIN_ACCESS_TOKEN || "").trim();
  const received = request.headers.get("Authorization") || "";
  return expected && received === `Bearer ${expected}`;
}

function mapOrder(row) {
  // A existência do evento prova que o webhook foi recebido e validado.
  // O status da tentativa de encaminhamento ao Power Automate é separado.
  const webhookStatus = row.webhook_status ? "received" : "pending";
  const powerAutomateStatus = row.webhook_status === "completed"
    ? "sent"
    : row.webhook_status === "failed" && row.status === "paid"
      ? "inconsistent"
      : row.webhook_status === "failed"
        ? "failed"
        : row.webhook_status === "processing"
          ? "pending"
          : "not_sent";

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    personType: row.person_type,
    classId: row.class_id,
    desiredSlots: row.desired_slots,
    paymentReference: row.payment_reference,
    orderId: row.order_id,
    paymentStatus: row.status === "paid" ? "paid" : row.status,
    webhookStatus,
    powerAutomateStatus,
    transactionUuid: row.transaction_uuid,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    powerAutomateSentAt: row.power_automate_sent_at
  };
}

export async function handleAdminOrdersRequest(request, env) {
  if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405);
  if (!isAuthorized(request, env)) return jsonResponse({ error: "Não autorizado" }, 401);
  if (!env.PAYMENTS_DB) return jsonResponse({ error: "PAYMENTS_DB não configurado" }, 500);

  try {
    const result = await env.PAYMENTS_DB
      .prepare(
        `SELECT o.id, o.name, o.email, o.person_type, o.class_id, o.desired_slots,
                o.payment_reference, o.order_id, o.status, o.transaction_uuid,
                o.created_at, o.updated_at, o.paid_at,
                e.status AS webhook_status, e.processed_at AS power_automate_sent_at
         FROM payment_orders o
         LEFT JOIN payment_events e
           ON e.transaction_uuid = o.transaction_uuid OR e.order_id = o.order_id
         ORDER BY o.created_at DESC
         LIMIT 100`
      )
      .all();

    return jsonResponse({ success: true, orders: (result.results || []).map(mapOrder) });
  } catch (error) {
    console.error(`[ADMIN] Failed to list orders error=${error?.message || "database error"}`);
    return jsonResponse({ error: "Não foi possível consultar os pedidos" }, 503);
  }
}
