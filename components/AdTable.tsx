"use client";

import { useMemo, useState } from "react";
import { fmtDec, fmtEur, fmtInt, fmtPct } from "@/lib/format";
import type { AdRow, Metrics } from "@/lib/types";
import { Status, Th } from "./ui";

type Key = "name" | "leads" | "costPerLead" | "termine" | "terminRate" | "spend" | "reach" | "frequency" | "linkCtr" | "linkClicks";

const rate = (t: number | null, l: number) => (t != null && l > 0 ? (t / l) * 100 : null);

const COLS: { key: Key; label: string; sub: string; get: (m: Metrics, t: number | null) => number | null; fmt: (v: number | null) => string }[] = [
  { key: "leads", label: "Leads", sub: "", get: (m) => m.leads, fmt: fmtInt },
  { key: "costPerLead", label: "Kosten / Ergebnis", sub: "€ pro Lead", get: (m) => m.costPerLead, fmt: fmtEur },
  { key: "termine", label: "Termine", sub: "Terminbuchungen", get: (_, t) => t, fmt: fmtInt },
  { key: "terminRate", label: "Terminquote", sub: "Termine / Leads", get: (m, t) => rate(t, m.leads), fmt: fmtPct },
  { key: "spend", label: "Ausgegeben", sub: "€ im Zeitraum", get: (m) => m.spend, fmt: fmtEur },
  { key: "reach", label: "Reichweite", sub: "Personen", get: (m) => m.reach, fmt: fmtInt },
  { key: "frequency", label: "Frequenz", sub: "Ø pro Person", get: (m) => m.frequency, fmt: fmtDec },
  { key: "linkCtr", label: "CTR (Link)", sub: "Link-Klick-Rate", get: (m) => m.linkCtr, fmt: fmtPct },
  { key: "linkClicks", label: "Link-Klicks", sub: "", get: (m) => m.linkClicks, fmt: fmtInt },
];

function Thumb({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />;
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-thumb-from to-thumb-to text-[11px] font-semibold text-white">
      {name.replace(/[^a-z0-9]/gi, "").slice(-2).toUpperCase() || "AD"}
    </div>
  );
}

export function AdTable({ ads, total, totalTermine }: { ads: AdRow[]; total: Metrics; totalTermine: number | null }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "leads", dir: -1 });

  const sorted = useMemo(() => {
    const col = COLS.find((c) => c.key === sort.key);
    const val = (r: AdRow) => (sort.key === "name" ? r.name : col ? col.get(r.metrics, r.termine) : null);
    return [...ads].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (x == null) return 1;
      if (y == null) return -1;
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [ads, sort]);

  const click = (key: Key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "name" ? 1 : -1 }));
  const arrow = (key: Key) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y border-line bg-page/60">
          <tr>
            <Th label="Anzeige" align="left">
              <button onClick={() => click("name")} className="uppercase hover:text-violet">Anzeige{arrow("name")}</button>
            </Th>
            {COLS.map((c) => (
              <Th key={c.key} label={c.label} sub={c.sub || undefined}>
                <button onClick={() => click(c.key)} className="whitespace-nowrap uppercase hover:text-violet">{c.label}{arrow(c.key)}</button>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular">
          {sorted.map((ad) => (
            <tr key={ad.id} className="border-b border-line last:border-0 hover:bg-page/50">
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <Thumb name={ad.name} url={ad.thumbnailUrl} />
                  <div>
                    <p className="whitespace-nowrap font-medium">{ad.name}</p>
                    <Status status={ad.status} />
                  </div>
                </div>
              </td>
              {COLS.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-3 py-3 text-right">{c.fmt(c.get(ad.metrics, ad.termine))}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="tabular bg-ink text-white">
          <tr>
            <td className="px-3 py-4 font-semibold">GESAMT</td>
            {COLS.map((c) => (
              <td key={c.key} className="whitespace-nowrap px-3 py-4 text-right font-semibold">{c.fmt(c.get(total, totalTermine))}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
