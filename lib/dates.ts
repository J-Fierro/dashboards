import type { DateRange } from "./types";

export const PRESETS = [
  { key: "last_7d", label: "Letzte 7 Tage", days: 7 },
  { key: "last_14d", label: "Letzte 14 Tage", days: 14 },
  { key: "last_30d", label: "Letzte 30 Tage", days: 30 },
  { key: "last_90d", label: "Letzte 90 Tage", days: 90 },
] as const;

function todayVienna() {
  // en-CA formats as yyyy-mm-dd
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna" }).format(new Date());
}

function shift(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Resolve ?preset= or ?since=&until= into a range. Like Ads Manager, presets
 * end yesterday, because today's numbers are still incomplete.
 */
export function resolveRange(params: { preset?: string; since?: string; until?: string }, fallback?: DateRange): DateRange {
  if (params.since && params.until && ISO.test(params.since) && ISO.test(params.until) && params.since <= params.until) {
    return { since: params.since, until: params.until };
  }
  const preset = PRESETS.find((p) => p.key === params.preset);
  if (preset) {
    const until = shift(todayVienna(), -1);
    return { since: shift(until, -(preset.days - 1)), until };
  }
  if (fallback) return fallback;
  const until = shift(todayVienna(), -1);
  return { since: shift(until, -29), until };
}
