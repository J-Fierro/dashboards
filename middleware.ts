// Access control: every client gets a private link with a secret key.
//
//   https://<domain>/mister-marketing?key=<ACCESS_MISTER_MARKETING>
//
// The first visit swaps the key for a signed cookie (90 days) and removes the
// key from the address bar. A client's cookie only opens that client's pages.
// ADMIN_TOKEN opens everything, including the client list at "/".
//
// Changing a key in Vercel revokes its links and every cookie made from it.

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  runtime: "nodejs",
  // Everything except Next.js assets, the logo and the no-access page.
  matcher: ["/((?!_next/|icon\\.svg|p8-logo\\.svg|kein-zugriff).*)"],
};

const MAX_AGE = 60 * 60 * 24 * 90;
const ADMIN_COOKIE = "p8_admin";
const clientCookie = (slug: string) => `p8_c_${slug}`;
const clientEnv = (slug: string) => `ACCESS_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function sign(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function deny(req: NextRequest) {
  return NextResponse.rewrite(new URL("/kein-zugriff", req.url), { status: 403 });
}

export function middleware(req: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Local development without auth configured stays open; production stays closed.
    return process.env.NODE_ENV === "development" ? NextResponse.next() : deny(req);
  }

  const slug = req.nextUrl.pathname.split("/")[1] ?? "";
  const adminToken = process.env.ADMIN_TOKEN;
  const clientToken = slug ? process.env[clientEnv(slug)] : undefined;

  // 1. A key in the URL: check it, set the cookie, redirect to the clean URL.
  const key = req.nextUrl.searchParams.get("key");
  if (key) {
    const isAdmin = !!adminToken && same(key, adminToken);
    const isClient = !!clientToken && same(key, clientToken);
    if (!isAdmin && !isClient) return deny(req);

    const clean = req.nextUrl.clone();
    clean.searchParams.delete("key");
    const res = NextResponse.redirect(clean);
    const cookie = isAdmin
      ? { name: ADMIN_COOKIE, value: sign(secret, `admin:${adminToken}`) }
      : { name: clientCookie(slug), value: sign(secret, `${slug}:${clientToken}`) };
    res.cookies.set({ ...cookie, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
    return res;
  }

  // 2. No key: a valid cookie for this client, or the admin cookie.
  const admin = req.cookies.get(ADMIN_COOKIE)?.value;
  if (adminToken && admin && same(admin, sign(secret, `admin:${adminToken}`))) return NextResponse.next();

  const client = slug ? req.cookies.get(clientCookie(slug))?.value : undefined;
  if (clientToken && client && same(client, sign(secret, `${slug}:${clientToken}`))) return NextResponse.next();

  return deny(req);
}
