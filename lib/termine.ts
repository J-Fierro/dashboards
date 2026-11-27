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

/** Digits only, so "120253887564880169" and "'120253887564880169" both work. */
const toAdId = (value: string) => value.replace(/\D/g, "");

/**
 * Counts rows marked "JA" in Terminbuchung inside the date range and assigns
 * them to ads. Also counts "gekauft" = JA (purchases); null when the sheet has
 * no such column. Columns are found by header name, not position, since the
 * existing sheets don't all have the same column order.
 *
 * Assignment uses the "Ad-ID" column. Rows without an ID fall back to the ad
 * name, but only when exactly one ad in the group has that name; ambiguous or
 * unknown names count as unmatched rather than guessing.
 */
export function countTermine(
  values: string[][],
  range: DateRange,
  ads: { id: string; name: string }[],
  source: TermineResult["source"],
): TermineResult {
  const result: TermineResult = { total: 0, byAd: new Map(), unmatched: 0, purchases: null, source };
  if (values.length < 2) return result;
  const [header, ...rows] = values;
  const cDate = findCol(header, ["datum"]);
  const cTermin = findCol(header, ["terminbuchung", "termin"]);
  const cAdId = findCol(header, ["ad-id", "ad id", "ad_id", "adid", "anzeigen-id"]);
  const cAd = findCol(header, ["ad", "anzeige"]);
  const cKauf = findCol(header, ["gekauft", "kauf"]);
  if (cKauf >= 0) result.purchases = 0;
  if (cTermin < 0 && cKauf < 0) return result;

  const ids = new Set(ads.map((a) => a.id));
  const byName = new Map<string, string | null>(); // null = name used by several ads
  for (const ad of ads) {
    const key = normalizeAdName(ad.name);
    byName.set(key, byName.has(key) ? null : ad.id);
  }

  const isJa = (col: number, row: string[]) => col >= 0 && (row[col] ?? "").trim().toUpperCase() === "JA";

  for (const row of rows) {
    if (cDate >= 0) {
      const day = toIsoDay(row[cDate] ?? "");
      if (!day || day < range.since || day > range.until) continue;
    }
    // Purchases: "gekauft" = JA, counted by lead date like the Termine.
    if (result.purchases != null && isJa(cKauf, row)) result.purchases++;

    if (!isJa(cTermin, row)) continue;
    result.total++;

    const rawId = cAdId >= 0 ? toAdId(row[cAdId] ?? "") : "";
    const adId = rawId ? (ids.has(rawId) ? rawId : null) : cAd >= 0 ? (byName.get(normalizeAdName(row[cAd] ?? "")) ?? null) : null;
    if (adId) result.byAd.set(adId, (result.byAd.get(adId) ?? 0) + 1);
    else result.unmatched++;
  }
  return result;
}
