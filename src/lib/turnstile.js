// Verificação server-side do token Turnstile
// Chama /api/turnstile-verify antes de cada pedido sensível

export async function verifyTurnstile(token) {
  if (!token) return false;
  try {
    const res = await fetch("/api/turnstile-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
