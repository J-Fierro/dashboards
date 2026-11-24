"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PRESETS } from "@/lib/dates";
import { fmtDate } from "@/lib/format";
import type { DateRange } from "@/lib/types";

export function DateRangePicker({ range, locked }: { range: DateRange; locked?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [since, setSince] = useState(range.since);
  const [until, setUntil] = useState(range.until);
  const ref = useRef<HTMLDivElement>(null);

  const preset = PRESETS.find((p) => p.key === params.get("preset"));
  const label = locked ? "Export-Zeitraum" : preset?.label ?? (params.get("since") ? "Zeitraum" : "Letzte 30 Tage");

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(next: Record<string, string>) {
    setOpen(false);
    start(() => router.push(`${pathname}?${new URLSearchParams(next)}`));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !locked && setOpen((o) => !o)}
        title={locked ? "Testdaten: fester Zeitraum aus dem Ads-Manager-Export" : undefined}
        className={`flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-[13px] ${locked ? "cursor-default" : "hover:bg-white/10"} ${pending ? "opacity-60" : ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        {label}: {fmtDate(range.since)} – {fmtDate(range.until)}
        {!locked && (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-line bg-white p-2 text-ink shadow-xl">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => go({ preset: p.key })}
              className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-page ${preset?.key === p.key ? "font-semibold text-violet" : ""}`}
            >
              {p.label}
            </button>
          ))}
          <div className="mt-2 border-t border-line px-1 pt-3">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Benutzerdefiniert</p>
            <div className="flex gap-2 px-2">
              <input type="date" value={since} max={until} onChange={(e) => setSince(e.target.value)} className="w-full rounded border border-line px-2 py-1 text-sm" />
              <input type="date" value={until} min={since} onChange={(e) => setUntil(e.target.value)} className="w-full rounded border border-line px-2 py-1 text-sm" />
            </div>
            <button onClick={() => go({ since, until })} className="mx-2 mt-2 mb-1 w-[calc(100%-1rem)] rounded bg-ink py-1.5 text-sm text-white hover:bg-ink-soft">
              Anwenden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
