import type { DateRange, TermineResult } from "./types";

/**
 * Normalizes ad names so a lead sheet entry still matches after Meta renames
 * a duplicated ad: "Video_03 - Kopie", "Video_03 – Copy 2", "Video_03 (Kopie)"
 * all become "video_03".
 */
export function normalizeAdName(name: string) {
  let n = name.toLowerCase().replace(/\s+/g, " ").trim();
  const suffix = /\s*(?:[-–—]\s*(?:kopie|copy)(?:\s*\d+)?|\((?:kopie|copy)(?:\s*\d+)?\))$/;
  while (suffix.test(n)) n = n.replace(suffix, "").trim();
  return n;
}

const findCol = (header: string[], names: string[]) =>
  header.findIndex((h) => names.includes(h.trim().toLowerCase()));

/** Accepts "2026-11-08 09:42:17", "2026-11-08" and "08.11.2026 ..." */
function toIsoDay(value: string): string | null {
  const v = value.trim();
  let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

/**
 * Counts rows marked "JA" in Terminbuchung inside the date range, and assigns
 * them to ads by name. Columns are found by header name, not position, since
 * the existing sheets don't all have the same column order.
 */
export function countTermine(values: string[][], range: DateRange, adNames: string[], source: TermineResult["source"]): TermineResult {
  const result: TermineResult = { total: 0, byAd: new Map(), unmatched: 0, source };
  if (values.length < 2) return result;
  const [header, ...rows] = values;
  const cDate = findCol(header, ["datum"]);
  const cTermin = findCol(header, ["terminbuchung", "termin"]);
  const cAd = findCol(header, ["ad", "anzeige"]);
  if (cTermin < 0) return result;

  const known = new Set(adNames.map(normalizeAdName));
  for (const row of rows) {
    if ((row[cTermin] ?? "").trim().toUpperCase() !== "JA") continue;
    if (cDate >= 0) {
      const day = toIsoDay(row[cDate] ?? "");
      if (!day || day < range.since || day > range.until) continue;
    }
    result.total++;
    const ad = cAd >= 0 ? normalizeAdName(row[cAd] ?? "") : "";
    if (ad && known.has(ad)) result.byAd.set(ad, (result.byAd.get(ad) ?? 0) + 1);
    else result.unmatched++;
  }
  return result;
}
