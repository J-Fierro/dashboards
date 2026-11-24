export function KpiTile({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-p8-navy/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-p8-navy/55">{label}</p>
      <p className={`tabular mt-1 text-2xl font-semibold ${accent ? "text-p8-magenta" : ""}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-p8-navy/50">{hint}</p>}
    </div>
  );
}
