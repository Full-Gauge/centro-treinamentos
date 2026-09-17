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

  return {
    transactionId: payload?.id ?? "",
    transactionUuid: payload?.uuid ?? attributes.uuid ?? "",
    orderId: attributes.order_id ?? "",
    resource: payload?.resource,
    statusCode: Number(status.code)
  };
}

function getPaymentReference(details) {
  return String(details.transactionUuid || details.orderId || details.transactionId || "").trim();
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
    details.statusCode !== 8
  ) {
    return jsonResponse({ success: false, error: "Invalid payment confirmation event" }, 400);
  }

  const powerAutomateHeaders = requirePowerAutomateHeaders(env);
  if (powerAutomateHeaders.error) return powerAutomateHeaders.error;

  const forwardedHeaders = new Headers(powerAutomateHeaders.headers);
  forwardedHeaders.set(
    "Content-Type",
    request.headers.get("Content-Type") || "application/json"
  );
  forwardedHeaders.set("X-CT-Source", "ipag-webhook");

  for (const headerName of ["X-Ipag-Signature", "X-Ipag-Event", "X-Ipag-Timestamps"]) {
    const value = request.headers.get(headerName);
    if (value) forwardedHeaders.set(headerName, value);
  }

  try {
    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: forwardedHeaders,
      body: rawBody
    });

    if (response.ok) {
      const paymentReference = getPaymentReference(details);
      if (env.URL_SHORTENER_KV && paymentReference) {
        await env.URL_SHORTENER_KV.put(
          `ipag-payment:${paymentReference}`,
          JSON.stringify({
            status: "confirmed",
            transactionId: details.transactionId,
            transactionUuid: details.transactionUuid,
            orderId: details.orderId,
            confirmedAt: new Date().toISOString()
          }),
          { expirationTtl: 60 * 60 * 24 * 7 }
        );
      }

      console.log(
        `[IPAG] TransactionCaptured forwarded successfully transactionId=${details.transactionId} orderId=${details.orderId}`
      );
      return jsonResponse({ success: true, message: "Payment confirmation received" });
    }

    console.error(
      `[IPAG] Failed to forward TransactionCaptured to Power Automate transactionId=${details.transactionId} orderId=${details.orderId} powerAutomateStatus=${response.status}`
    );
    return jsonResponse({ success: false, error: "Payment confirmation processing failed" }, 502);
  } catch (error) {
    console.error(
      `[IPAG] Failed to forward TransactionCaptured to Power Automate transactionId=${details.transactionId} orderId=${details.orderId} error=${error?.message || "network error"}`
    );
    return jsonResponse({ success: false, error: "Payment confirmation processing failed" }, 502);
  }
}
