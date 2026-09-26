import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "admin_auth";

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function expectedCookie(password: string): string {
  return createHmac("sha256", password).update("admin").digest("hex");
}

/** HMAC of a constant, keyed by ADMIN_PASSWORD — never store the password itself. */
export function adminCookieValue(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return expectedCookie(password);
}

/** True when the request carries a valid admin cookie. */
export async function isAdminAuthed(): Promise<boolean> {
  const expected = adminCookieValue();
  if (!expected) return false;
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!cookie && safeEqual(cookie, expected);
}
