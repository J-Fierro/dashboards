import { fmtDate } from "@/lib/format";
import type { DateRange } from "@/lib/types";

export function SourceNote({ fixed, termineSource }: { fixed: DateRange | null; termineSource: string }) {
  const parts: string[] = [];
  if (fixed) parts.push(`Testdaten aus dem Ads-Manager-Export (${fmtDate(fixed.since)} – ${fmtDate(fixed.until)}). Der Zeitraumfilter ist aktiv, sobald die Meta-API angebunden ist.`);
  if (termineSource === "fixture") parts.push("Termine aus lokaler Kopie der Lead-Liste (kein Google-Service-Account konfiguriert).");
  if (!parts.length) return null;
  return (
    <div className="rounded-lg border border-p8-teal/30 bg-p8-aqua/15 px-4 py-2 text-sm text-p8-navy/80">
      {parts.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
