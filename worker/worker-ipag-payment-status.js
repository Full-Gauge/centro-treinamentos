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

  if (!env.URL_SHORTENER_KV) {
    return jsonResponse({ success: false, error: "Payment status is not configured" }, 500);
  }

  try {
    const stored = await env.URL_SHORTENER_KV.get(`ipag-payment:${reference}`, "json");
    if (!stored) {
      return jsonResponse({ success: true, status: "pending", confirmed: false });
    }

    return jsonResponse({ success: true, ...stored, confirmed: stored.status === "confirmed" });
  } catch {
    return jsonResponse({ success: false, error: "Could not read payment status" }, 502);
  }
}
