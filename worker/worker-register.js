import { requirePowerAutomateHeaders } from "./power-automate.js";
import { updatePaymentOrder } from "./payment-orders.js";

export async function handleRegisterRequest(request, env, ctx) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "POST" }
    });
  }

  const targetUrl = env.url_registro;

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        error: "Configuração pendente: url_registro não definida no painel da Cloudflare."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const formData = await request.json();
    const paymentReference = String(formData.paymentReference || "").trim();
    if (env.PAYMENTS_DB && !paymentReference) {
      return new Response(JSON.stringify({ error: "paymentReference é obrigatório." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { headers, error } = requirePowerAutomateHeaders(env);
    if (error) return error;

    const upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(formData)
    });

    if (upstreamResponse.ok && paymentReference) {
      await updatePaymentOrder(env, paymentReference, {
        status: "registration_submitted",
        registration_submitted_at: new Date().toISOString(),
        class_id: formData.turmas || null,
        desired_slots:
          Number.isInteger(Number(formData.vagasDesejadas)) && Number(formData.vagasDesejadas) > 0
            ? Number(formData.vagasDesejadas)
            : null
      });
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: upstreamResponse.headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Erro ao processar o registro: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
