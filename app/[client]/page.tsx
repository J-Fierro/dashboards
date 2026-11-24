import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getClient } from "@/config/clients";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Header } from "@/components/Header";
import { KpiTile } from "@/components/KpiTile";
import { SourceNote } from "@/components/SourceNote";
import { StatusBadge } from "@/components/StatusBadge";
import { getOverview } from "@/lib/dashboard";
import { resolveRange } from "@/lib/dates";
import { fmtDec, fmtEur, fmtInt, fmtPct } from "@/lib/format";
import { fixedRange } from "@/lib/sources";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ client: string }>;
  searchParams: Promise<{ preset?: string; since?: string; until?: string }>;
};

export default async function ClientOverview({ params, searchParams }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const fixed = fixedRange(client);
  const range = fixed ?? resolveRange(await searchParams);
  const { rows, totals, termineSource } = await getOverview(client, range);
  const qs = new URLSearchParams(await searchParams).toString();

  return (
    <>
      <Header title={client.name} back={{ href: "/", label: "Alle Kunden" }} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Übersicht</h2>
          <Suspense>
            <DateRangePicker range={range} disabled={!!fixed} />
          </Suspense>
        </div>

        <SourceNote fixed={fixed} termineSource={termineSource} />

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiTile label="Ausgaben" value={fmtEur(totals.spend)} />
          <KpiTile label="Leads" value={fmtInt(totals.leads)} accent />
          <KpiTile label="Kosten pro Lead" value={fmtEur(totals.costPerLead)} />
          <KpiTile label="Termine" value={fmtInt(totals.termine)} accent />
          <KpiTile label="Kosten pro Termin" value={fmtEur(totals.costPerTermin)} />
          <KpiTile label="Termin-Quote" value={fmtPct(totals.terminRate)} hint="Termine / Leads" />
          <KpiTile label="Impressionen" value={fmtInt(totals.impressions)} hint={`CPM ${fmtEur(totals.cpm)}`} />
          <KpiTile label="Link-CTR" value={fmtPct(totals.linkCtr)} hint={`${fmtInt(totals.linkClicks)} Link-Klicks`} />
        </section>

        <section className="overflow-x-auto rounded-xl border border-p8-navy/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-p8-navy/10 text-left text-xs uppercase tracking-wide text-p8-navy/55">
              <tr>
                <th className="px-4 py-3">Kampagne</th>
                <th className="px-3 py-3 text-right">Leads</th>
                <th className="px-3 py-3 text-right">CPL</th>
                <th className="px-3 py-3 text-right">Termine</th>
                <th className="px-3 py-3 text-right">Ausgaben</th>
                <th className="px-3 py-3 text-right">Tagesbudget</th>
                <th className="px-3 py-3 text-right">Reichweite</th>
                <th className="px-3 py-3 text-right">Frequenz</th>
                <th className="px-3 py-3 text-right">Link-CTR</th>
              </tr>
            </thead>
            <tbody className="tabular divide-y divide-p8-navy/5">
              {rows.map((r) => (
                <tr key={r.slug} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/${client.slug}/${r.slug}${qs ? `?${qs}` : ""}`} className="font-medium hover:text-p8-magenta">
                      {r.label} →
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-p8-navy/50">
                      <span>{r.metaName}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">{fmtInt(r.metrics.leads)}</td>
                  <td className="px-3 py-3 text-right">{fmtEur(r.metrics.costPerLead)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-p8-magenta">{fmtInt(r.termine)}</td>
                  <td className="px-3 py-3 text-right">{fmtEur(r.metrics.spend)}</td>
                  <td className="px-3 py-3 text-right">{fmtEur(r.dailyBudget)}</td>
                  <td className="px-3 py-3 text-right">{fmtInt(r.metrics.reach)}</td>
                  <td className="px-3 py-3 text-right">{fmtDec(r.metrics.frequency)}</td>
                  <td className="px-3 py-3 text-right">{fmtPct(r.metrics.linkCtr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
