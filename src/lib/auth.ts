import { cookies } from "next/headers";

// Single-user, self-hosted auth. Bewust simpel gehouden.
// Het sessiecookie bevat een token afgeleid van AUTH_SECRET.
// Middleware (edge) checkt alleen aanwezigheid + gelijkheid.

export const SESSION_COOKIE = "wgp_session";

export function sessionToken(): string {
  const secret = process.env.AUTH_SECRET ?? "";
  // Het token is het secret zelf. Single-user, httpOnly cookie, self-hosted.
  // Voldoende voor V1; later te vervangen door een echte sessietabel.
  return secret;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return Boolean(value) && value === sessionToken();
}

export async function signIn(password: string): Promise<boolean> {
  const expected = process.env.APP_PASSWORD;
  if (!expected || password !== expected) return false;
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dagen
  });
  return true;
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
