export async function handleAttendanceRequest(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
    });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'O campo e-mail é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Integração com o Power Automate
    const powerAutomateUrl = env.ATTENDANCE_WEBHOOK_URL || env.url_registro_presenca;
    
    if (!powerAutomateUrl) {
      return new Response(JSON.stringify({ error: 'Configuração ATTENDANCE_WEBHOOK_URL ausente no Cloudflare.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Envia os dados para o Power Automate
    const flowResponse = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        confirmacao_presencao: "Sim"
      })
    });

    if (!flowResponse.ok) {
      throw new Error(`Falha na comunicação com o Power Automate: ${flowResponse.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: flowResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro inesperado no worker de registro de presença:', error);
    return new Response(JSON.stringify({ error: `Erro interno do servidor: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
