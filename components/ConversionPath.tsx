import { Fragment } from "react";
import { fmtInt, fmtPct } from "@/lib/format";

export interface PathInput {
  impressions: number;
  linkClicks: number;
  leads: number;
  termine: number | null;
  /** null when the lead sheet has no "gekauft" column; the step is then hidden. */
  purchases?: number | null;
}

const pct = (a: number | null, b: number) => (a != null && b > 0 ? (a / b) * 100 : null);

// Static class names so Tailwind picks them up: boxes alternate with rate arrows.
const GRID: Record<number, string> = {
  4: "md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]",
  5: "md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]",
};

/** Impression to purchase: the count at each step and the rate between steps. */
export function ConversionPath({ data }: { data: PathInput }) {
  const steps = [
    { label: "Impressionen", value: data.impressions },
    { label: "Link-Klicks", value: data.linkClicks },
    { label: "Leads", value: data.leads },
    { label: "Termine", value: data.termine },
  ];
  const rates = [
    { value: pct(data.linkClicks, data.impressions), label: "Klickrate" },
    { value: pct(data.leads, data.linkClicks), label: "Klick → Lead" },
    { value: pct(data.termine, data.leads), label: "Lead → Termin" },
  ];
  if (data.purchases != null) {
    steps.push({ label: "Gekauft", value: data.purchases });
    rates.push({ value: pct(data.purchases, data.termine ?? 0), label: "Termin → Kauf" });
  }

  return (
    <div className={`grid grid-cols-1 gap-3 px-5 pb-5 ${GRID[steps.length]} md:items-center md:gap-0`}>
      {steps.map((s, i) => (
        <Fragment key={s.label}>
          <div className={`rounded-lg border px-4 py-3.5 ${i === steps.length - 1 ? "border-violet/25 bg-violet/[0.04]" : "border-line"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{s.label}</p>
            <p className={`tabular mt-1 text-2xl font-bold ${i === steps.length - 1 ? "text-violet" : ""}`}>{fmtInt(s.value)}</p>
          </div>
          {i < rates.length && (
            <div className="flex items-center justify-center gap-2 md:flex-col md:gap-0.5 md:px-3">
              <span className="tabular rounded-full bg-page px-2.5 py-1 text-xs font-semibold">{fmtPct(rates[i].value)}</span>
              <span className="text-[11px] whitespace-nowrap text-muted">{rates[i].label}</span>
              <svg viewBox="0 0 24 8" className="hidden h-2 w-8 text-muted/60 md:block" aria-hidden>
                <path d="M0 4h21m-4-3 4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
