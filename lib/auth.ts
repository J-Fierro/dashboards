// Password login. Each client has one password (stored only as a scrypt hash
// in config/clients.ts); the P8 admin password opens every dashboard.
// After login a signed cookie keeps the browser logged in. It is renewed on
// every visit, so it only expires after 90 days without a visit.

import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const MAX_AGE = 60 * 60 * 24 * 90;
export const ADMIN_COOKIE = "p8_admin";
export const clientCookie = (slug: string) => `p8_c_${slug}`;

function same(a: string | Buffer, b: string | Buffer) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Hash format: scrypt$<salt hex>$<key hex>, created by `npm run hash-password`. */
export function checkPassword(password: string, hash: string | undefined) {
  if (!hash) return false;
  const [algo, salt, key] = hash.split("$");
  if (algo !== "scrypt" || !salt || !key) return false;
  const derived = scryptSync(password, Buffer.from(salt, "hex"), key.length / 2);
  return same(derived, Buffer.from(key, "hex"));
}

/**
 * Cookie value for a login. Tied to the password hash, so changing a password
 * logs out everyone who used the old one. SESSION_SECRET, if set, is mixed in.
 */
export function sessionValue(scope: string, hash: string) {
  return createHmac("sha256", `${process.env.SESSION_SECRET ?? ""}|${hash}`).update(scope).digest("hex");
}

export function validSession(cookie: string | undefined, scope: string, hash: string | undefined) {
  return !!cookie && !!hash && same(cookie, sessionValue(scope, hash));
}

export const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
