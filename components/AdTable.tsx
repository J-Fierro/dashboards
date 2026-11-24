"use client";

import { useMemo, useState } from "react";
import { fmtDec, fmtEur, fmtInt, fmtPct } from "@/lib/format";
import type { AdRow } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

type Key = "name" | "leads" | "costPerLead" | "termine" | "spend" | "impressions" | "reach" | "frequency" | "cpm" | "linkCtr" | "linkClicks";

const COLS: { key: Key; label: string; fmt: (r: AdRow) => string; value: (r: AdRow) => number | string | null }[] = [
  { key: "leads", label: "Leads", fmt: (r) => fmtInt(r.metrics.leads), value: (r) => r.metrics.leads },
  { key: "costPerLead", label: "CPL", fmt: (r) => fmtEur(r.metrics.costPerLead), value: (r) => r.metrics.costPerLead },
  { key: "termine", label: "Termine", fmt: (r) => fmtInt(r.termine), value: (r) => r.termine },
  { key: "spend", label: "Ausgaben", fmt: (r) => fmtEur(r.metrics.spend), value: (r) => r.metrics.spend },
  { key: "impressions", label: "Impressionen", fmt: (r) => fmtInt(r.metrics.impressions), value: (r) => r.metrics.impressions },
  { key: "reach", label: "Reichweite", fmt: (r) => fmtInt(r.metrics.reach), value: (r) => r.metrics.reach },
  { key: "frequency", label: "Frequenz", fmt: (r) => fmtDec(r.metrics.frequency), value: (r) => r.metrics.frequency },
  { key: "cpm", label: "CPM", fmt: (r) => fmtEur(r.metrics.cpm), value: (r) => r.metrics.cpm },
  { key: "linkCtr", label: "Link-CTR", fmt: (r) => fmtPct(r.metrics.linkCtr), value: (r) => r.metrics.linkCtr },
  { key: "linkClicks", label: "Link-Klicks", fmt: (r) => fmtInt(r.metrics.linkClicks), value: (r) => r.metrics.linkClicks },
];

function Thumb({ ad }: { ad: AdRow }) {
  if (ad.thumbnailUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={ad.thumbnailUrl} alt="" className="h-12 w-12 rounded-md object-cover" />;
  }
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-p8-purple to-p8-teal text-xs font-semibold text-white">
      {ad.name.replace(/[^a-z0-9]/gi, "").slice(-2).toUpperCase() || "AD"}
    </div>
  );
}

export function AdTable({ ads }: { ads: AdRow[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "leads", dir: -1 });

  const sorted = useMemo(() => {
    const col = COLS.find((c) => c.key === sort.key);
    const val = (r: AdRow) => (sort.key === "name" ? r.name : col?.value(r) ?? null);
    return [...ads].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (x == null) return 1; // empty values always last
      if (y == null) return -1;
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [ads, sort]);

  const click = (key: Key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "name" ? 1 : -1 }));
  const arrow = (key: Key) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");

  return (
    <div className="overflow-x-auto rounded-xl border border-p8-navy/10 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-p8-navy/10 text-left text-xs uppercase tracking-wide text-p8-navy/55">
          <tr>
            <th className="px-4 py-3">
              <button onClick={() => click("name")} className="uppercase hover:text-p8-magenta">Anzeige{arrow("name")}</button>
            </th>
            {COLS.map((c) => (
              <th key={c.key} className="px-3 py-3 text-right">
                <button onClick={() => click(c.key)} className="whitespace-nowrap uppercase hover:text-p8-magenta">{c.label}{arrow(c.key)}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular divide-y divide-p8-navy/5">
          {sorted.map((ad) => (
            <tr key={ad.id} className="hover:bg-surface">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Thumb ad={ad} />
                  <div>
                    <p className="font-medium">{ad.name}</p>
                    <StatusBadge status={ad.status} />
                  </div>
                </div>
              </td>
              {COLS.map((c) => (
                <td key={c.key} className={`whitespace-nowrap px-3 py-3 text-right ${c.key === "termine" ? "font-semibold text-p8-magenta" : ""}`}>
                  {c.fmt(ad)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
