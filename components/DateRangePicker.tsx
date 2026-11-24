"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { PRESETS } from "@/lib/dates";
import { fmtDate } from "@/lib/format";
import type { DateRange } from "@/lib/types";

export function DateRangePicker({ range, disabled }: { range: DateRange; disabled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [since, setSince] = useState(range.since);
  const [until, setUntil] = useState(range.until);
  const active = params.get("preset");

  function go(next: Record<string, string>) {
    const q = new URLSearchParams(next).toString();
    setOpen(false);
    start(() => router.push(`${pathname}?${q}`));
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${pending ? "opacity-60" : ""}`}>
      {PRESETS.map((p) => (
        <button
          key={p.key}
          disabled={disabled}
          onClick={() => go({ preset: p.key })}
          className={`rounded-full border px-3 py-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
            active === p.key
              ? "border-p8-magenta bg-p8-magenta text-white"
              : "border-p8-navy/15 bg-white hover:border-p8-magenta/50"
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="relative">
        <button
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="tabular rounded-full border border-p8-navy/15 bg-white px-3 py-1 text-sm hover:border-p8-magenta/50 disabled:cursor-not-allowed"
        >
          {fmtDate(range.since)} – {fmtDate(range.until)}
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-2 flex items-end gap-2 rounded-xl border border-p8-navy/10 bg-white p-3 shadow-lg">
            <label className="text-xs text-p8-navy/60">
              Von
              <input type="date" value={since} max={until} onChange={(e) => setSince(e.target.value)} className="mt-1 block rounded border border-p8-navy/15 px-2 py-1 text-sm text-p8-navy" />
            </label>
            <label className="text-xs text-p8-navy/60">
              Bis
              <input type="date" value={until} min={since} onChange={(e) => setUntil(e.target.value)} className="mt-1 block rounded border border-p8-navy/15 px-2 py-1 text-sm text-p8-navy" />
            </label>
            <button onClick={() => go({ since, until })} className="rounded bg-p8-navy px-3 py-1.5 text-sm text-white hover:bg-p8-magenta">
              Anwenden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
