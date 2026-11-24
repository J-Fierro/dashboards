import type { ReactNode } from "react";
import { fmtDate } from "@/lib/format";
import type { DateRange } from "@/lib/types";

export function Panel({ title, note, aside, children }: { title: string; note?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-5 pb-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
          {note && <p className="mt-0.5 text-sm text-muted">{note}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Column header with an optional second line saying what the number means. */
export function Th({ label, sub, align = "right", children }: { label: string; sub?: string; align?: "left" | "right"; children?: ReactNode }) {
  return (
    <th className={`px-3 pt-3 pb-2.5 align-bottom font-normal first:pl-6 last:pr-6 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="text-[13px] font-semibold text-ink">{children ?? label}</div>
      {sub && <div className="mt-0.5 whitespace-nowrap text-xs text-muted">{sub}</div>}
    </th>
  );
}

export const td = "px-3 py-3.5 first:pl-6 last:pr-6";

export function SourceTag({ mock }: { mock: boolean }) {
  if (!mock) return null;
  return (
    <span className="rounded-full border border-warn/40 bg-warn/8 px-3 py-1 text-xs font-medium text-warn">
      Testdaten aus dem Ads-Manager-Export
    </span>
  );
}

export function Footer({ source }: { source: string }) {
  return <footer className="py-10 text-center text-xs text-muted">Daten: {source}. Erstellt von P8 Content Power.</footer>;
}

export function sourceLabel(mock: boolean, termineSource: string) {
  const meta = mock ? "Meta Ads (Export)" : "Meta Ads";
  if (termineSource === "sheet") return `${meta} und Lead-Liste in Google Sheets`;
  if (termineSource === "fixture") return `${meta} und lokale Kopie der Lead-Liste`;
  return meta;
}

export function rangeText(r: DateRange) {
  return `${fmtDate(r.since)} bis ${fmtDate(r.until)}`;
}

const STATUS: Record<string, { text: string; dot: string }> = {
  ACTIVE: { text: "Läuft", dot: "bg-ok" },
  PAUSED: { text: "Pausiert", dot: "bg-warn" },
  CAMPAIGN_PAUSED: { text: "Kampagne pausiert", dot: "bg-warn" },
  ADSET_PAUSED: { text: "Anzeigengruppe pausiert", dot: "bg-warn" },
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
