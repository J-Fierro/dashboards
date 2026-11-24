// de-DE puts the euro sign after the number ("1.234,56 €").
const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const int = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const dec2 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const DASH = "—";
export const fmtEur = (v: number | null) => (v == null ? DASH : eur.format(v));
export const fmtInt = (v: number | null) => (v == null ? DASH : int.format(v));
export const fmtDec = (v: number | null) => (v == null ? DASH : dec2.format(v));
export const fmtPct = (v: number | null) => (v == null ? DASH : `${dec2.format(v)} %`);

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function timeVienna(date = new Date()) {
  return new Intl.DateTimeFormat("de-AT", { timeZone: "Europe/Vienna", hour: "2-digit", minute: "2-digit" }).format(date);
}
