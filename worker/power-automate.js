export function requirePowerAutomateHeaders(env) {
  if (!env.API_KEY) {
    return {
      error: new Response(
        JSON.stringify({
          error: "Configuracao pendente: API_KEY nao definida no Worker."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.API_KEY
    }
  };
}

export function buildPaymentLinkCreatedPayload({
  paymentReference,
  link,
  uuid,
  orderId,
  name,
  email,
  amount,
  classId,
  desiredSlots
}) {
  return {
    event: "payment_link.created",
    event_id: `payment_link.created:${paymentReference}`,
    payment_reference: paymentReference,
    ipag_uuid: uuid || null,
    order_id: orderId || null,
    name,
    email,
    payment_link: link,
    amount: Number(amount),
    status: "PENDING_PAYMENT",
    class_id: classId || null,
    desired_slots: Number(desiredSlots) || 1,
    created_at: new Date().toISOString()
  };
}

export async function forwardPaymentLinkCreated(env, payload) {
  const targetUrl = String(env.POWER_AUTOMATE_PAYMENT_LINK_CREATED_URL || "").trim();
  if (!targetUrl) return { sent: false, reason: "not_configured" };

  const eventKey = `payment-link-created:${payload.payment_reference}`;
  if (env.URL_SHORTENER_KV && await env.URL_SHORTENER_KV.get(eventKey)) {
    return { sent: false, duplicate: true };
  }

  const powerAutomateHeaders = requirePowerAutomateHeaders(env);
  if (powerAutomateHeaders.error || !env.POWER_AUTOMATE_WEBHOOK_TOKEN) {
    return { sent: false, reason: "headers_not_configured" };
  }

  const headers = new Headers(powerAutomateHeaders.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-CT-Webhook-Token", env.POWER_AUTOMATE_WEBHOOK_TOKEN);

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(`Power Automate status=${response.status}`);

  if (env.URL_SHORTENER_KV) {
    await env.URL_SHORTENER_KV.put(eventKey, "sent", { expirationTtl: 60 * 60 * 24 * 7 });
  }

  return { sent: true };
}
