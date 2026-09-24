import { handleTurmasRequest } from '../worker/workers-turmas.js';
import { handleModulosRequest } from '../worker/worker-modulos.js';
import { handleRegisterRequest } from '../worker/worker-register.js';
import { handleTokenValidation } from '../worker/worker-token.js';
import { handleAttendanceRequest } from '../worker/worker-attendance.js';
import { handleJwtGenerationRequest } from '../worker/worker-jwt-generator.js';
import { handleConfirmationRequest } from '../worker/worker-confirmation.js';
import { handleCancellationRequest } from '../worker/worker-cancellation.js';
import { handleShortenRequest, handleRedirectRequest } from '../worker/worker-url-shortener.js';
import { handleNameValidationRequest } from '../worker/worker-name-validator.js';
import { handleNameValidationFlowRequest } from '../worker/worker-name-validation-flow.js';
import { handleCpfModulosValidationFlowRequest } from '../worker/worker-cpf-modulos-validation-flow.js';
import { handleParceirosRequest } from '../worker/worker-parceiros.js';
import { handlePaymentLinkRequest } from '../worker/worker-ipag.js';
import { handleIpagPaymentConfirmed } from '../worker/worker-ipag-payment-confirmed.js';
import { handleIpagPaymentStatusRequest } from '../worker/worker-ipag-payment-status.js';
import { publicTurnstileConfig } from '../worker/worker-turnstile.js';

function serveStaticAsset(request, env) {
  return env.ASSETS.fetch(request).then((response) => {
    const contentType = response.headers.get('Content-Type') || '';
    if (!/^(text\/|application\/(javascript|json))/i.test(contentType) || /charset=/i.test(contentType)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Content-Type', `${contentType}; charset=UTF-8`);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });
}


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

    // 2.1 Roteamento para a API de Parceiros
    if (url.pathname.replace(/\/$/, "") === "/api/parceiros") {
      return handleParceirosRequest(request, env, ctx);
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

    // 6.2 Roteamento para a API de validação de nome
    if (url.pathname.replace(/\/$/, "") === "/api/validate-name") {
      return handleNameValidationRequest(request, env, ctx);
    }

    // 6.3 Roteamento para a validação de nome no Power Automate
    if (url.pathname.replace(/\/$/, "") === "/api/validate-name-flow") {
      return handleNameValidationFlowRequest(request, env, ctx);
    }

    // 6.4 Roteamento para a validação de CPF e módulos no Power Automate
    if (url.pathname.replace(/\/$/, "") === "/api/validate-cpf-modulos-flow") {
      return handleCpfModulosValidationFlowRequest(request, env, ctx);
    }

    // 6.6 Roteamento para a geração de link de pagamento (iPag)
    if (url.pathname.replace(/\/$/, "") === "/api/payment-link") {
      return handlePaymentLinkRequest(request, env, ctx);
    }

    if (url.pathname.replace(/\/$/, "") === "/api/public-config") {
      return publicTurnstileConfig(env);
    }

    // 6.7 Webhook de confirmação de pagamento do iPag
    if (url.pathname.replace(/\/$/, "") === "/api/webhooks/ipag/payment-confirmed") {
      return handleIpagPaymentConfirmed(request, env, ctx);
    }

    // 6.8 Consulta do estado da reserva/pagamento iPag
    if (url.pathname.replace(/\/$/, "") === "/api/payment-status") {
      return handleIpagPaymentStatusRequest(request, env, ctx);
    }

    // 6.5 Handler de Redirecionamento para URLs encurtadas (/s/[codigo])
    if (url.pathname.startsWith("/s/")) {
      return handleRedirectRequest(request, env, ctx);
    }

    // 7. Fallback: Se não for uma rota de API, entrega os arquivos estáticos (HTML, JS, CSS)
    return serveStaticAsset(request, env);
  }
};
