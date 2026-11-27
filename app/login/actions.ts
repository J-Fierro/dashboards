"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClient } from "@/config/clients";
import { ADMIN_COOKIE, checkPassword, clientCookie, cookieOptions, sessionValue } from "@/lib/auth";

/** Only allow redirects back into this site. */
function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(_: { error?: string } | undefined, form: FormData) {
  const password = String(form.get("password") ?? "");
  const next = safeNext(String(form.get("next") ?? "/"));
  const slug = next.split("/")[1] ?? "";
  const client = slug ? getClient(slug) : undefined;
  const jar = await cookies();

  if (client && checkPassword(password, slug)) {
    jar.set(clientCookie(slug), sessionValue(slug)!, cookieOptions);
    redirect(next);
  }
  if (checkPassword(password, "admin")) {
    jar.set(ADMIN_COOKIE, sessionValue("admin")!, cookieOptions);
    redirect(next);
  }

  // Slow down guessing a little.
  await new Promise((r) => setTimeout(r, 600));
  return { error: "Das Passwort stimmt nicht." };
}
