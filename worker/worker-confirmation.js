import { requirePowerAutomateHeaders } from "./power-automate.js";

export async function handleConfirmationRequest(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    let email = body.email;
    let codigo_turma = body.codigo_turma;
    const attendance = body.attendance;

    // Se não veio e-mail direto, tenta extrair do Token (caso venha da tela de confirmação de inscrição)
    if (body.token) {
      try {
        const payloadBase64 = body.token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
          if (!email) email = decoded.email;
          if (!codigo_turma) codigo_turma = decoded.classId;
        }
      } catch (e) {
        console.error("Erro ao decodificar token no worker:", e);
      }
    }

    if (!email || !attendance) {
      return new Response(JSON.stringify({ error: 'E-mail (ou token válido) e presença são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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
