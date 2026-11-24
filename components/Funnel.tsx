import { fmtEur, fmtInt, fmtPct } from "@/lib/format";

export interface FunnelInput {
  impressions: number;
  linkClicks: number;
  leads: number;
  termine: number | null;
  spend: number;
}

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : null);
const per = (spend: number, n: number | null) => (n && n > 0 ? spend / n : null);

/**
 * The path from impression to booked appointment, with the conversion rate
 * between each step and the cost of each step. The band below the numbers
 * narrows on a log scale, since the steps differ by orders of magnitude.
 */
export function Funnel({ data }: { data: FunnelInput }) {
  const stages = [
    { label: "Impressionen", value: data.impressions, cost: `${fmtEur(per(data.spend, data.impressions / 1000))} pro 1.000` },
    { label: "Link-Klicks", value: data.linkClicks, cost: `${fmtEur(per(data.spend, data.linkClicks))} pro Klick` },
    { label: "Leads", value: data.leads, cost: `${fmtEur(per(data.spend, data.leads))} pro Lead` },
    { label: "Termine", value: data.termine, cost: `${fmtEur(per(data.spend, data.termine))} pro Termin` },
  ];
  const steps = [
    { rate: pct(data.linkClicks, data.impressions), text: "klicken" },
    { rate: pct(data.leads, data.linkClicks), text: "tragen sich ein" },
    { rate: data.termine == null ? null : pct(data.termine, data.leads), text: "buchen einen Termin" },
  ];

  // Band heights: log scale between 18 % and 100 % of the band.
  const max = Math.log10(Math.max(data.impressions, 10) + 1);
  const h = stages.map((s) => 0.18 + 0.82 * (Math.log10((s.value ?? 0) + 1) / max));
  const W = 100 * stages.length;
  const H = 100;
  const top = (i: number) => (H - h[i] * H) / 2;
  const bottom = (i: number) => H - top(i);
  // Flat across each column's middle, tapering between columns.
  const pts: string[] = [];
  stages.forEach((_, i) => pts.push(`${i * 100 + (i === 0 ? 0 : 30)},${top(i)}`, `${i * 100 + (i === stages.length - 1 ? 100 : 70)},${top(i)}`));
  const back: string[] = [];
  stages.forEach((_, i) => back.push(`${i * 100 + (i === 0 ? 0 : 30)},${bottom(i)}`, `${i * 100 + (i === stages.length - 1 ? 100 : 70)},${bottom(i)}`));
  const shape = [...pts, ...back.reverse()].join(" ");

  return (
    <div>
      <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
        {stages.map((s) => (
          <div key={s.label} className="pr-4">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="tabular font-display text-4xl font-semibold tracking-tight lg:text-5xl">{fmtInt(s.value)}</p>
            <p className="tabular mt-1 text-sm text-ink-soft">{s.cost}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-6 hidden sm:block">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-16 w-full" role="img" aria-label="Trichter von Impressionen zu Terminen">
          <defs>
            <linearGradient id="funnel" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--color-plum)" />
              <stop offset="1" stopColor="var(--color-teal)" />
            </linearGradient>
          </defs>
          <polygon points={shape} fill="url(#funnel)" />
        </svg>
        {/* Conversion rates sit on the tapers between stages. */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4">
          {stages.map((s, i) => (
            <div key={s.label} className="relative">
              {i > 0 && steps[i - 1] && (
                <span className="tabular absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink shadow-sm ring-1 ring-line">
                  {fmtPct(steps[i - 1].rate)} {steps[i - 1].text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Small screens: rates as a list instead of on the band. */}
      <ul className="mt-5 space-y-1 text-sm text-ink-soft sm:hidden">
        {steps.map((s) => (
          <li key={s.text} className="tabular">
            {fmtPct(s.rate)} {s.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
