import { cookies } from "next/headers";

const SESSION_COOKIE = "cpb_session";

export async function setSession(companySlug: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, companySlug, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionSlug() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
