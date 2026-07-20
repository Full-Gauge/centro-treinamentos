export function requirePowerAutomateHeaders(env) {
  if (!env.API_KEY) {
    return {
      error: new Response(
        JSON.stringify({
          error: "Configuracao pendente: API_KEY nao definida no Worker."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.API_KEY
    }
  };
}
