export async function handleCancellationRequest(request, env, ctx) {
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
    const cancellation = body.cancellation;

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

    if (!email || !cancellation) {
      return new Response(JSON.stringify({ error: 'E-mail (ou token válido) e cancelamento são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

        const webhookUrl = env.CANCELLATION_WEBHOOK_URL || env.CONFIRMATION_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'Configuração CANCELLATION_WEBHOOK_URL (ou CONFIRMATION_WEBHOOK_URL) ausente no Cloudflare.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }


        const flowResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        codigo_turma: codigo_turma,
        confirmacao_cancelamento: cancellation
      })
    });

    const responseText = await flowResponse.text();

    return new Response(JSON.stringify({
      success: flowResponse.ok,
      upstreamStatus: flowResponse.status,
      upstreamBody: responseText
    }), {
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
