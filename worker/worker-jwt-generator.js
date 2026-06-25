import { SignJWT } from 'jose';

export async function handleJwtGenerationRequest(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { classId, email, modules = [] } = await request.json();

    if (!classId || !email || !modules) {
      return new Response(JSON.stringify({ error: 'classId/email/modules são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.JWT_SECRET) {
      return new Response(JSON.stringify({ error: 'JWT_SECRET não configurada no Worker.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== env.API_KEY) {
        return new Response(JSON.stringify({
            error: "Não autorizado. Chave de API inválida."
        }), { status: 401 });
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);

    
    // Gera o token com validade (ex: 7 dias)
    const jwt = await new SignJWT({
      classId,
      email,
      modules: Array.isArray(modules) ? modules : []
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') 
      .sign(secret);

    return new Response(JSON.stringify({ token: jwt }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro na geração de JWT:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
