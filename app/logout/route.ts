import { NextResponse, type NextRequest } from "next/server";
import { clients } from "@/config/clients";
import { ADMIN_COOKIE, clientCookie } from "@/lib/auth";

export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(ADMIN_COOKIE);
  for (const c of clients) res.cookies.delete(clientCookie(c.slug));
  return res;
}
