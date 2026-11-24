"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => router.refresh())}
      title="Daten neu laden"
      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 hover:bg-white/10"
    >
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2" />
        <path d="M21 4v5h-5M3 20v-5h5" />
      </svg>
    </button>
  );
}
