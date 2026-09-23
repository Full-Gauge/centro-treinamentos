import { jwtVerify } from "jose";

export async function verifyRegistrationToken(token, env) {
  if (!env.JWT_SECRET || typeof token !== "string" || !token.trim()) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    return payload;
  } catch (error) {
    console.error("JWT validation failed:", error?.message || "invalid token");
    return null;
  }
}

export function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
