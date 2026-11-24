const eur = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" });
const int = new Intl.NumberFormat("de-AT", { maximumFractionDigits: 0 });
const dec2 = new Intl.NumberFormat("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtEur = (v: number | null) => (v == null ? "–" : eur.format(v));
export const fmtInt = (v: number | null) => (v == null ? "–" : int.format(v));
export const fmtDec = (v: number | null) => (v == null ? "–" : dec2.format(v));
export const fmtPct = (v: number | null) => (v == null ? "–" : `${dec2.format(v)} %`);

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
