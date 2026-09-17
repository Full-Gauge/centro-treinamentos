function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function getPaymentDetails(payload) {
  const attributes = payload?.attributes || {};
  const status = attributes.status || {};
  const statusMessage = String(status.message || "").trim().toUpperCase();

  return {
    transactionId: payload?.id ?? "",
    transactionUuid: payload?.uuid ?? "",
    orderId: attributes.order_id ?? "",
    resource: payload?.resource,
    captured: Number(status.code) === 8 || statusMessage === "CAPTURED"
  };
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
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ success: false, error: "Invalid payment confirmation event" }, 400);
  }

  const ipagEvent = request.headers.get("X-Ipag-Event");
  const details = getPaymentDetails(payload);
  if (
    (ipagEvent && ipagEvent !== "TransactionCaptured") ||
    details.resource !== "transactions" ||
    !details.captured
  ) {
    return jsonResponse({ success: false, error: "Invalid payment confirmation event" }, 400);
  }

  const forwardedHeaders = new Headers({
    "Content-Type": request.headers.get("Content-Type") || "application/json",
    "X-CT-Source": "ipag-webhook"
  });

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
