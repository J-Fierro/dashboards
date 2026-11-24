"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-7">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="text-sm font-medium">
        Passwort
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="mt-1.5 block w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
      />
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-md bg-ink py-2.5 text-sm font-medium text-white hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Wird geprüft …" : "Anmelden"}
      </button>
      <p className="mt-4 text-xs text-muted">Du bleibst auf diesem Gerät angemeldet.</p>
    </form>
  );
}
