import { NextResponse, type NextRequest } from "next/server";
import { getClient } from "@/config/clients";
import { ADMIN_COOKIE, clientCookie, cookieOptions, sessionValue, validSession } from "@/lib/auth";

export const config = {
  runtime: "nodejs",
  // Everything except Next.js assets, the logo files, login and logout.
  matcher: ["/((?!_next/|icon\\.svg|p8-logo\\.svg|login|logout).*)"],
};

export function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.split("/")[1] ?? "";
  const client = slug ? getClient(slug) : undefined;

  // Admin login opens everything.
  if (validSession(req.cookies.get(ADMIN_COOKIE)?.value, "admin")) {
    const res = NextResponse.next();
    res.cookies.set(ADMIN_COOKIE, sessionValue("admin")!, cookieOptions);
    return res;
  }

  // Client login opens only that client's pages.
  if (client && validSession(req.cookies.get(clientCookie(slug))?.value, slug)) {
    const res = NextResponse.next();
    res.cookies.set(clientCookie(slug), sessionValue(slug)!, cookieOptions);
    return res;
  }

  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(login);
}
