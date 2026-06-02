export async function handleConfirmationRequest(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email, attendance } = await request.json();

    if (!email || !attendance) {
      return new Response(JSON.stringify({ error: 'Os campos e-mail e presença são obrigatórios.' }), {
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

    const flowResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
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