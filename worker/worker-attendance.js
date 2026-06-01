import { jwtVerify, importJWK } from 'jose';

export async function handleAttendanceRequest(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
    });
  }

  try {
    const { token, attendance } = await request.json();

    if (!token || !attendance) {
      return new Response(JSON.stringify({ error: 'Dados incompletos: token e attendance são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.JWT_SECRET) {
      return new Response(JSON.stringify({ error: 'JWT_SECRET não configurado no ambiente do Worker.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let classId;
    let email;
    try {
      // Importa a chave secreta para verificação
      const secret = new TextEncoder().encode(env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Extrai classId e email do payload do JWT
      classId = payload.classId;
      email = payload.email;

      if (!classId || !email) {
        return new Response(JSON.stringify({ error: 'Payload do JWT inválido: classId ou email ausentes.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (jwtError) {
      console.error('Erro na validação do JWT:', jwtError);
      return new Response(JSON.stringify({ error: 'Token de acesso inválido ou expirado.' }), {
        status: 401,
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
        codigo_turma: classId,
        confirmacao_presencao: attendance
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
