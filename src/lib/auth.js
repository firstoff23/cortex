// Wrapper Clerk — funciona com ou sem autenticação configurada
// Sem VITE_CLERK_PUBLISHABLE_KEY → retorna userId "anon" em tudo

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const clerkEnabled = !!CLERK_KEY;

let _clerk = null;

export async function initClerk() {
  if (!clerkEnabled || _clerk) return _clerk;
  const { Clerk } = await import("@clerk/clerk-js");
  _clerk = new Clerk(CLERK_KEY);
  await _clerk.load();
  return _clerk;
}

export async function getClerk() {
  if (!clerkEnabled) return null;
  return _clerk ?? (await initClerk());
}

export async function getUserId() {
  if (!clerkEnabled) return "anon";
  const clerk = await getClerk();
  return clerk?.user?.id ?? "anon";
}

export async function getUserEmail() {
  if (!clerkEnabled) return null;
  const clerk = await getClerk();
  return clerk?.user?.primaryEmailAddress?.emailAddress ?? null;
}

export async function signIn() {
  const clerk = await getClerk();
  if (!clerk) return;
  clerk.openSignIn();
}

export async function signOut() {
  const clerk = await getClerk();
  if (!clerk) return;
  await clerk.signOut();
}

export async function getSessionToken() {
  if (!clerkEnabled) return null;
  const clerk = await getClerk();
  return clerk?.session?.getToken() ?? null;
}

// Listener para mudanças de estado de auth
// uso: onAuthChange(({ userId }) => setUserId(userId))
export async function onAuthChange(callback) {
  const clerk = await getClerk();
  if (!clerk) {
    callback({ userId: "anon", user: null });
    return () => {};
  }
  return clerk.addListener(({ user }) => {
    callback({ userId: user?.id ?? "anon", user });
  });
}
