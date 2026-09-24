function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleIpagPaymentStatusRequest(request, env) {
  if (request.method !== "GET") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const reference = String(new URL(request.url).searchParams.get("reference") || "").trim();
  if (!reference) {
    return jsonResponse({ success: false, error: "Payment reference is required" }, 400);
  }

  if (!env.PAYMENTS_DB && !env.URL_SHORTENER_KV) {
    return jsonResponse({ success: false, error: "Payment status is not configured" }, 500);
  }

  try {
    if (env.PAYMENTS_DB) {
      const event = await env.PAYMENTS_DB
        .prepare(
          "SELECT status, transaction_uuid, order_id, payment_reference, processed_at FROM payment_events WHERE payment_reference = ? ORDER BY created_at DESC LIMIT 1"
        )
        .bind(reference)
        .first();

      if (event?.status === "completed") {
        return jsonResponse({
          success: true,
          status: "confirmed",
          confirmed: true,
          transactionUuid: event.transaction_uuid,
          orderId: event.order_id,
          paymentReference: event.payment_reference,
          confirmedAt: event.processed_at
        });
      }

      if (event?.status === "processing") {
        return jsonResponse({ success: true, status: "processing", confirmed: false });
      }

      if (event?.status === "failed") {
        return jsonResponse({ success: true, status: "failed", confirmed: false });
      }

      // O iPag pode confirmar usando o order_id LINK-* sem devolver o
      // external_code FG-* criado pelo portal.
      const order = await env.PAYMENTS_DB
        .prepare(
          "SELECT status, transaction_uuid, order_id, payment_reference, paid_at FROM payment_orders WHERE payment_reference = ? LIMIT 1"
        )
        .bind(reference)
        .first();

      if (order?.status === "paid") {
        return jsonResponse({
          success: true,
          status: "confirmed",
          confirmed: true,
          transactionUuid: order.transaction_uuid,
          orderId: order.order_id,
          paymentReference: order.payment_reference,
          confirmedAt: order.paid_at
        });
      }
    }

    if (!env.URL_SHORTENER_KV) {
      return jsonResponse({ success: true, status: "pending", confirmed: false });
    }

    const stored = await env.URL_SHORTENER_KV.get(`ipag-payment:${reference}`, "json");
    if (!stored) {
      return jsonResponse({ success: true, status: "pending", confirmed: false });
    }

    return jsonResponse({ success: true, ...stored, confirmed: stored.status === "confirmed" });
  } catch {
    return jsonResponse({ success: false, error: "Could not read payment status" }, 502);
  }
}
