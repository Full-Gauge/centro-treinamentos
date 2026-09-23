// Integração com o iPag para gerar links de pagamento (Pix e cartão de crédito).
// Referência: POST /service/v2/payment_links em https://developers.ipag.com.br/pt-br/payment-link/reference
import { createPaymentOrder, updatePaymentOrder } from "./payment-orders.js";

const IPAG_SANDBOX_BASE = "https://sandbox.ipag.com.br";

function basicAuthToken(apiId, apiKey) {
  return "Basic " + btoa(`${apiId}:${apiKey}`);
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

// O iPag aceita: all | creditcard | boleto | pix
function normalizePaymentMethod(value) {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "pix") return "pix";
  if (["cartao", "cartão", "credito", "crédito", "creditcard", "credit_card", "card"].includes(v)) return "creditcard";
  return "all";
}

function formatIpagDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function defaultExpiresAt(days) {
  return formatIpagDate(new Date(Date.now() + days * 86400000));
}

export async function handlePaymentLinkRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido. Use POST." }, 405);
  }

  if (!env.IPAG_API_ID || !env.IPAG_API_KEY) {
    return jsonResponse(
      { error: "Configuração pendente: IPAG_API_ID / IPAG_API_KEY não definidas no Worker." },
      500
    );
  }

  const baseUrl = (env.IPAG_BASE_URL || IPAG_SANDBOX_BASE).replace(/\/+$/, "");

  try {
    const body = await request.json();
    const name = String(body.name ?? body.fullName ?? "").trim();
    const taxReceipt = String(body.cpfCnpj ?? body.cpf ?? body.tax_receipt ?? "").trim();
    const amount = "1000.00";
    const description =
      body.description || env.IPAG_DEFAULT_DESCRIPTION || "Inscrição - Centro de Treinamentos Full Gauge";
    const paymentMethod = normalizePaymentMethod(body.paymentMethod ?? body.formaPagamento);
    const externalCode = `FG-${crypto.randomUUID()}`;
    const expiresAt = body.expiresAt || defaultExpiresAt(Number(env.IPAG_LINK_EXPIRES_DAYS || 7));

    const parsedAmount = Number(amount);
    const email = String(body.email || "").trim();
    const phone = String(body.phone ?? "").replace(/\D/g, "");
    if (!name || !taxReceipt || !Number.isFinite(parsedAmount) || !email.includes("@") || phone.length < 10) {
      return jsonResponse(
        { error: "Campos obrigatórios: name, cpfCnpj, email e telefone válidos." },
        400
      );
    }

    const payload = {
      external_code: externalCode,
      amount,
      description,
      additional_info: body.additionalInfo || "",
      expires_at: expiresAt,
      customer: {
        name,
        cpf_cnpj: taxReceipt,
        email,
        phone
      },
      checkout_settings: {
        payment_method: paymentMethod
      }
    };

    if (!env.PAYMENTS_DB) {
      return jsonResponse({ error: "Persistência de reservas não está configurada." }, 500);
    }

    try {
      await createPaymentOrder(env, {
        id: crypto.randomUUID(),
        paymentReference: externalCode,
        name,
        email,
        taxReceipt,
        phone,
        relationType: body.relacao,
        personType: body.tipoPessoa,
        classId: body.turmas,
        desiredSlots:
          Number.isInteger(Number(body.vagasDesejadas)) && Number(body.vagasDesejadas) > 0
            ? Number(body.vagasDesejadas)
            : null
      });
    } catch (error) {
      console.error(`[IPAG] Failed to reserve payment order error=${error?.message || "database error"}`);
      return jsonResponse({ error: "Não foi possível criar a reserva local." }, 503);
    }

    const upstream = await fetch(`${baseUrl}/service/v2/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuthToken(env.IPAG_API_ID, env.IPAG_API_KEY)
      },
      body: JSON.stringify(payload)
    });

    const raw = await upstream.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!upstream.ok) {
      await updatePaymentOrder(env, externalCode, { status: "link_failed" }).catch((error) => {
        console.error(`[IPAG] Failed to update payment order status error=${error?.message || "database error"}`);
      });
      return jsonResponse(
        {
          error: "Falha ao gerar o link de pagamento no iPag.",
          upstreamStatus: upstream.status
        },
        upstream.status
      );
    }

    const attributes = data?.attributes || {};
    const paymentReference = attributes.external_code || externalCode;
    await updatePaymentOrder(env, externalCode, {
      status: "pending_payment",
      payment_reference: paymentReference,
      ipag_uuid: attributes.uuid || null,
      order_id: attributes.order_id || null
    });
    return jsonResponse({
    success: true,
    link: data?.links?.payment || "",
    uuid: attributes.uuid || "",
    externalCode: paymentReference,
    paymentReference,
    amount: attributes.amount ?? amount,
      paymentMethod,
      upstreamStatus: upstream.status
    });
  } catch (error) {
    return jsonResponse({ error: `Erro interno ao gerar o link de pagamento: ${error.message}` }, 500);
  }
}
