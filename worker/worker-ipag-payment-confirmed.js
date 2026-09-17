import { requirePowerAutomateHeaders } from "./power-automate.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function createHmacSignature(rawBody, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));

  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function hexToBytes(value) {
  if (!/^[0-9a-f]{64}$/i.test(value)) return null;

  return value.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16));
}

function signaturesMatch(expected, received) {
  const expectedBytes = hexToBytes(expected);
  const receivedBytes = hexToBytes(String(received || "").trim());

  if (!expectedBytes || !receivedBytes) return false;

  let difference = 0;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= expectedBytes[index] ^ receivedBytes[index];
  }

  return difference === 0;
}

function getPaymentDetails(payload) {
  const attributes = payload?.attributes || {};
  const status = attributes.status || {};
  const acquirer = attributes.acquirer || {};
  const customer = attributes.customer || {};

  return {
    transactionId: payload?.id ?? "",
    transactionUuid: payload?.uuid ?? attributes.uuid ?? "",
    orderId: attributes.order_id ?? "",
    paymentLinkExternalCode:
      attributes.payment_link_external_code ||
      payload?.payment_link_external_code ||
      attributes.external_code ||
      payload?.external_code ||
      "",
    resource: payload?.resource,
    statusCode: Number(status.code),
    amount: Number(attributes.amount),
    status: String(status.message || "").trim().toUpperCase(),
    paymentMethod: attributes.method || "",
    installments: Number(attributes.installments),
    capturedAt: attributes.captured_at || "",
    acquirer: typeof acquirer === "string" ? acquirer : acquirer.name || "",
    customerName: customer.name || "",
    customerEmail: customer.email || ""
  };
}

function getPowerAutomatePayload(details) {
  return {
    event: "payment.captured",
    transaction_uuid: details.transactionUuid,
    name: details.customerName,
    email: details.customerEmail,
    order_id: details.orderId,
    amount: details.amount,
    status: details.status,
    payment_method: details.paymentMethod,
    installments: details.installments,
    captured_at: details.capturedAt,
    acquirer: details.acquirer
  };
}

async function claimPaymentEvent(env, details) {
  if (!env.PAYMENTS_DB) {
    return { error: jsonResponse({ success: false, error: "Payment idempotency is not configured" }, 500) };
  }

  const idempotencyKey = `ipag:TransactionCaptured:${details.transactionUuid}`;
  const now = new Date().toISOString();
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const claimed = await env.PAYMENTS_DB
    .prepare(
      `INSERT INTO payment_events
        (idempotency_key, transaction_uuid, order_id, status, created_at, processed_at)
       VALUES (?, ?, ?, 'processing', ?, NULL)
       ON CONFLICT(idempotency_key) DO UPDATE SET
         status = 'processing',
         created_at = excluded.created_at,
         processed_at = NULL
       WHERE payment_events.status = 'failed'
          OR (payment_events.status = 'processing' AND payment_events.created_at < ?)
       RETURNING idempotency_key`
    )
    .bind(idempotencyKey, details.transactionUuid, details.orderId, now, staleBefore)
    .first();

  if (claimed) return { idempotencyKey, claimed: true };

  const existing = await env.PAYMENTS_DB
    .prepare("SELECT status FROM payment_events WHERE idempotency_key = ?")
    .bind(idempotencyKey)
    .first();

  if (existing?.status === "completed") {
    return { idempotencyKey, duplicate: true };
  }

  return { idempotencyKey, inFlight: true };
}

async function updatePaymentEvent(env, idempotencyKey, status, processedAt = null) {
  await env.PAYMENTS_DB
    .prepare("UPDATE payment_events SET status = ?, processed_at = ? WHERE idempotency_key = ?")
    .bind(status, processedAt, idempotencyKey)
    .run();
}

function getPaymentReferences(details) {
  return [
    details.paymentLinkExternalCode,
    details.transactionUuid,
    details.orderId,
    details.transactionId
  ]
    .map((value) => String(value || "").trim())
    .filter((value, index, values) => value && values.indexOf(value) === index);
}

export async function handleIpagPaymentConfirmed(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const powerAutomateUrl = env.POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL;
  if (!powerAutomateUrl) {
    return jsonResponse(
      { success: false, error: "Payment confirmation forwarding is not configured" },
      500
    );
  }

  if (!env.POWER_AUTOMATE_WEBHOOK_TOKEN) {
    return jsonResponse(
      { success: false, error: "Power Automate webhook token is not configured" },
      500
    );
  }

  const rawBody = await request.text();
  const receivedSignature = request.headers.get("X-Ipag-Signature");
  if (!env.IPAG_API_KEY) {
    return jsonResponse(
      { success: false, error: "iPag webhook signature validation is not configured" },
      500
    );
  }

  if (!receivedSignature) {
    return jsonResponse({ success: false, error: "Invalid iPag webhook signature" }, 401);
  }

  const expectedSignature = await createHmacSignature(rawBody, env.IPAG_API_KEY);
  if (!signaturesMatch(expectedSignature, receivedSignature)) {
    return jsonResponse({ success: false, error: "Invalid iPag webhook signature" }, 401);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ success: false, error: "Invalid payment confirmation event" }, 400);
  }

  const ipagEvent = request.headers.get("X-Ipag-Event");
  const details = getPaymentDetails(payload);
  if (
    ipagEvent !== "TransactionCaptured" ||
    details.resource !== "transactions" ||
    details.statusCode !== 8 ||
    details.status !== "CAPTURED" ||
    !details.transactionUuid
  ) {
    return jsonResponse({ success: false, error: "Invalid payment confirmation event" }, 400);
  }

  const powerAutomateHeaders = requirePowerAutomateHeaders(env);
  if (powerAutomateHeaders.error) return powerAutomateHeaders.error;

  let eventClaim;
  try {
    eventClaim = await claimPaymentEvent(env, details);
  } catch (error) {
    console.error(`[IPAG] Failed to claim idempotency key error=${error?.message || "database error"}`);
    return jsonResponse({ success: false, error: "Payment idempotency check failed" }, 503);
  }

  if (eventClaim.error) return eventClaim.error;
  if (eventClaim.duplicate) {
    console.log(
      `[IPAG] Duplicate TransactionCaptured ignored transactionUuid=${details.transactionUuid}`
    );
    return jsonResponse({ success: true, duplicate: true, message: "Payment already processed" });
  }
  if (eventClaim.inFlight) {
    console.log(
      `[IPAG] TransactionCaptured already processing transactionUuid=${details.transactionUuid}`
    );
    return jsonResponse({ success: true, duplicate: true, message: "Payment already processing" });
  }

  const forwardedHeaders = new Headers(powerAutomateHeaders.headers);
  forwardedHeaders.set("Content-Type", "application/json");
  forwardedHeaders.set("X-CT-Source", "ipag-webhook");
  forwardedHeaders.set("X-CT-Webhook-Token", env.POWER_AUTOMATE_WEBHOOK_TOKEN);

  for (const headerName of ["X-Ipag-Signature", "X-Ipag-Event", "X-Ipag-Timestamps"]) {
    const value = request.headers.get(headerName);
    if (value) forwardedHeaders.set(headerName, value);
  }

  try {
    const forwardedBody = JSON.stringify(getPowerAutomatePayload(details));
    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: forwardedHeaders,
      body: forwardedBody
    });

    if (response.ok) {
      await updatePaymentEvent(env, eventClaim.idempotencyKey, "completed", new Date().toISOString());

      const paymentReferences = getPaymentReferences(details);
      if (env.URL_SHORTENER_KV && paymentReferences.length) {
        const confirmation = JSON.stringify({
          status: "confirmed",
          transactionId: details.transactionId,
          transactionUuid: details.transactionUuid,
          orderId: details.orderId,
          paymentLinkExternalCode: details.paymentLinkExternalCode,
          confirmedAt: new Date().toISOString()
        });

        try {
          await Promise.all(
            paymentReferences.map((paymentReference) =>
              env.URL_SHORTENER_KV.put(`ipag-payment:${paymentReference}`, confirmation, {
                expirationTtl: 60 * 60 * 24 * 7
              })
            )
          );
        } catch (error) {
          console.error(
            `[IPAG] Payment confirmed but status cache failed transactionUuid=${details.transactionUuid} error=${error?.message || "KV error"}`
          );
        }
      }

      console.log(
        `[IPAG] TransactionCaptured forwarded successfully transactionId=${details.transactionId} orderId=${details.orderId}`
      );
      return jsonResponse({ success: true, message: "Payment confirmation received" });
    }

    console.error(
      `[IPAG] Failed to forward TransactionCaptured to Power Automate transactionId=${details.transactionId} orderId=${details.orderId} powerAutomateStatus=${response.status}`
    );
    await updatePaymentEvent(env, eventClaim.idempotencyKey, "failed");
    return jsonResponse({ success: false, error: "Payment confirmation processing failed" }, 502);
  } catch (error) {
    console.error(
      `[IPAG] Failed to forward TransactionCaptured to Power Automate transactionId=${details.transactionId} orderId=${details.orderId} error=${error?.message || "network error"}`
    );
    await updatePaymentEvent(env, eventClaim.idempotencyKey, "failed");
    return jsonResponse({ success: false, error: "Payment confirmation processing failed" }, 502);
  }
}
