import type { ReactNode } from "react";

const ACCENTS = {
  violet: "bg-violet",
  emerald: "bg-emerald",
  fuchsia: "bg-fuchsia",
  amber: "bg-amber",
} as const;

export function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: keyof typeof ACCENTS }) {
  return (
    <div className="rounded-xl bg-white px-4 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="tabular mt-2 text-[26px] font-bold leading-none">{value}</p>
      {sub && <p className="mt-2.5 text-[13px] text-muted">{sub}</p>}
      <div className={`mt-3 h-[3px] w-8 rounded-full ${ACCENTS[accent]}`} />
    </div>
  );
}

export function Panel({ title, subtitle, badges, children }: { title: string; subtitle?: ReactNode; badges?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        {badges && <div className="flex gap-2">{badges}</div>}
      </div>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "amber" }) {
  const cls = tone === "violet" ? "bg-violet/8 text-violet" : "bg-amber/12 text-amber-700";
  const dot = tone === "violet" ? "bg-violet" : "bg-amber";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

/** Column header with a small explanatory second line, as in the reference dashboard. */
export function Th({ label, sub, align = "right", children }: { label: string; sub?: string; align?: "left" | "right"; children?: ReactNode }) {
  return (
    <th className={`px-3 py-3 align-middle font-normal ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/80">{children ?? label}</div>
      {sub && <div className="mt-1 whitespace-nowrap text-[11px] text-muted">{sub}</div>}
    </th>
  );
}

export function Footer({ subtitle, source }: { subtitle: string; source: string }) {
  return (
    <footer className="py-8 text-center text-xs text-muted">
      Performance Dashboard P8 · {subtitle} · Datenquelle: {source}
    </footer>
  );
}

const STATUS: Record<string, { text: string; dot: string }> = {
  ACTIVE: { text: "Aktiv", dot: "bg-emerald" },
  PAUSED: { text: "Pausiert", dot: "bg-amber" },
  CAMPAIGN_PAUSED: { text: "Kampagne pausiert", dot: "bg-amber" },
  ADSET_PAUSED: { text: "Anzeigengruppe pausiert", dot: "bg-amber" },
  INACTIVE: { text: "Inaktiv", dot: "bg-muted" },
  NOT_DELIVERING: { text: "Keine Auslieferung", dot: "bg-muted" },
};

export function Status({ status }: { status: string }) {
  const s = STATUS[status] ?? { text: status.toLowerCase().replace(/_/g, " "), dot: "bg-muted" };
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.text}
    </span>
  );
}
