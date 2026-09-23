import { requirePowerAutomateHeaders } from "./power-automate.js";
import { jsonError, verifyRegistrationToken } from "./jwt.js";

export async function handleConfirmationRequest(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const tokenPayload = await verifyRegistrationToken(body.token, env);
    if (!tokenPayload?.email || !tokenPayload?.classId) {
      return jsonError("Token de inscrição inválido ou expirado.", 401);
    }

    const email = String(tokenPayload.email).trim();
    const codigo_turma = String(tokenPayload.classId).trim();
    const attendance = body.attendance;

    if (!attendance || !["Sim", "Não"].includes(String(attendance))) {
      return jsonError("Presença válida é obrigatória.", 400);
    }

    const webhookUrl = env.CONFIRMATION_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'Configuração CONFIRMATION_WEBHOOK_URL ausente no Cloudflare.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { headers, error } = requirePowerAutomateHeaders(env);
    if (error) return error;

    const flowResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: email,
        codigo_turma: codigo_turma,
        confirmacao_presencao: attendance
      })
    });

    return new Response(JSON.stringify({ success: flowResponse.ok }), {
      status: flowResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
