// Password login. Passwords live in Vercel environment variables:
//   ADMIN_PASSWORD               P8 team, opens every dashboard and the client list
//   PASSWORD_<CLIENT_SLUG>       one per client, e.g. PASSWORD_MISTER_MARKETING
// A client without its variable can't log in (only the admin can open it).
// After login a signed cookie keeps the browser logged in. It is renewed on
// every visit, so it only expires after 90 days without a visit.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const MAX_AGE = 60 * 60 * 24 * 90;
export const ADMIN_COOKIE = "p8_admin";
export const clientCookie = (slug: string) => `p8_c_${slug}`;

/** "mister-marketing" -> "PASSWORD_MISTER_MARKETING" */
export const passwordEnvName = (slug: string) => `PASSWORD_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;

/** The password for "admin" or a client slug, or undefined if not configured. */
export function passwordFor(scope: string): string | undefined {
  const value = scope === "admin" ? process.env.ADMIN_PASSWORD : process.env[passwordEnvName(scope)];
  return value?.trim() ? value.trim() : undefined;
}

const digest = (s: string) => createHash("sha256").update(s).digest();

function same(a: string | Buffer, b: string | Buffer) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string, scope: string) {
  const expected = passwordFor(scope);
  return !!expected && same(digest(input.trim()), digest(expected));
}

/**
 * Cookie value for a login. Derived from the password, so changing a password
 * in Vercel logs out everyone who used the old one. SESSION_SECRET, if set, is
 * mixed in.
 */
export function sessionValue(scope: string): string | null {
  const password = passwordFor(scope);
  if (!password) return null;
  return createHmac("sha256", `${process.env.SESSION_SECRET ?? ""}|${password}`).update(scope).digest("hex");
}

export function validSession(cookie: string | undefined, scope: string) {
  const expected = sessionValue(scope);
  return !!cookie && !!expected && same(cookie, expected);
}

export const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
