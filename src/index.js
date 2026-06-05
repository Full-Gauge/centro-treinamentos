import { handleTurmasRequest } from '../worker/workers-turmas.js';
import { handleModulosRequest } from '../worker/worker-modulos.js';
import { handleRegisterRequest } from '../worker/worker-register.js';
import { handleTokenValidation } from '../worker/worker-token.js';
import { handleAttendanceRequest } from '../worker/worker-attendance.js';
import { handleJwtGenerationRequest } from '../worker/worker-jwt-generator.js';
import { handleConfirmationRequest } from '../worker/worker-confirmation.js';
import { handleCancellationRequest } from '../worker/worker-cancellation.js';
import { handleShortenRequest, handleRedirectRequest } from '../worker/worker-url-shortener.js';


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Roteamento para a API de Turmas
    if (url.pathname.replace(/\/$/, "") === "/api/turmas") {
      return handleTurmasRequest(request, env, ctx);
    }

    // 2. Roteamento para a API de Módulos
    if (url.pathname.replace(/\/$/, "") === "/api/modulos") {
      return handleModulosRequest(request, env, ctx);
    }

    // 3. Roteamento para a API de Registro
    if (url.pathname.replace(/\/$/, "") === "/api/register") {
      return handleRegisterRequest(request, env, ctx);
    }

    // 4. Roteamento para a API de Validação de Token
    if (url.pathname.replace(/\/$/, "") === "/api/validate-token") {
      return handleTokenValidation(request, env, ctx);
    }

        // 4.1 Roteamento para a API de Confirmação
    if (url.pathname.replace(/\/$/, "") === "/api/confirmation") {
      return handleConfirmationRequest(request, env, ctx);
    }

    // 4.2 Roteamento para a API de Cancelamento
    if (url.pathname.replace(/\/$/, "") === "/api/cancellation") {
      return handleCancellationRequest(request, env, ctx);
    }

    // 5. Roteamento para a API de Registro de Presença

    if (url.pathname.replace(/\/$/, "") === "/api/attendance") {
      return handleAttendanceRequest(request, env, ctx);
    }

    // 6. Roteamento para a API de Geração de JWT
    if (url.pathname.replace(/\/$/, "") === "/api/generate-jwt-register-attendance") {
      return handleJwtGenerationRequest(request, env, ctx);
    }

    // 6.1 Roteamento para a API de Encurtamento de URL
    if (url.pathname.replace(/\/$/, "") === "/api/shorten-url") {
      return handleShortenRequest(request, env, ctx);
    }

    // 6.2 Handler de Redirecionamento para URLs encurtadas (/s/[codigo])
    if (url.pathname.startsWith("/s/")) {
      return handleRedirectRequest(request, env, ctx);
    }

    // 7. Fallback: Se não for uma rota de API, entrega os arquivos estáticos (HTML, JS, CSS)
    return env.ASSETS.fetch(request);
  }
};