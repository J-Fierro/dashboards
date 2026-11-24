const LABELS: Record<string, { text: string; cls: string }> = {
  ACTIVE: { text: "Aktiv", cls: "bg-emerald-50 text-emerald-700" },
  PAUSED: { text: "Pausiert", cls: "bg-amber-50 text-amber-700" },
  INACTIVE: { text: "Inaktiv", cls: "bg-p8-navy/5 text-p8-navy/60" },
  NOT_DELIVERING: { text: "Keine Auslieferung", cls: "bg-p8-navy/5 text-p8-navy/60" },
  CAMPAIGN_PAUSED: { text: "Kampagne pausiert", cls: "bg-amber-50 text-amber-700" },
  ADSET_PAUSED: { text: "Anzeigengruppe pausiert", cls: "bg-amber-50 text-amber-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = LABELS[status] ?? { text: status.toLowerCase().replace(/_/g, " "), cls: "bg-p8-navy/5 text-p8-navy/60" };
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.text}</span>;
}
