import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getClient, getGroup } from "@/config/clients";
import { AdTable } from "@/components/AdTable";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Header } from "@/components/Header";
import { KpiTile } from "@/components/KpiTile";
import { SourceNote } from "@/components/SourceNote";
import { getGroupDetail } from "@/lib/dashboard";
import { resolveRange } from "@/lib/dates";
import { fmtDec, fmtEur, fmtInt, fmtPct } from "@/lib/format";
import { fixedRange } from "@/lib/sources";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ client: string; group: string }>;
  searchParams: Promise<{ preset?: string; since?: string; until?: string }>;
};

export default async function GroupPage({ params, searchParams }: Props) {
  const { client: clientSlug, group: groupSlug } = await params;
  const client = getClient(clientSlug);
  const group = client && getGroup(client, groupSlug);
  if (!client || !group) notFound();

  const fixed = fixedRange(client);
  const sp = await searchParams;
  const range = fixed ?? resolveRange(sp);
  const { row, ads, termine } = await getGroupDetail(client, group, range);
  const m = row.metrics;
  const qs = new URLSearchParams(sp).toString();

  return (
    <>
      <Header title={`${client.name} · ${row.label}`} back={{ href: `/${client.slug}${qs ? `?${qs}` : ""}`, label: "Übersicht" }} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{row.label}</h2>
            <p className="text-sm text-p8-navy/55">{row.metaName}</p>
          </div>
          <Suspense>
            <DateRangePicker range={range} disabled={!!fixed} />
          </Suspense>
        </div>

        <SourceNote fixed={fixed} termineSource={termine?.source ?? "none"} />

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiTile label="Leads" value={fmtInt(m.leads)} accent />
          <KpiTile label="Kosten pro Lead" value={fmtEur(m.costPerLead)} />
          <KpiTile label="Termine" value={fmtInt(row.termine)} accent />
          <KpiTile label="Ausgaben" value={fmtEur(m.spend)} hint={row.dailyBudget != null ? `Tagesbudget ${fmtEur(row.dailyBudget)}` : undefined} />
          <KpiTile label="Impressionen" value={fmtInt(m.impressions)} hint={`CPM ${fmtEur(m.cpm)}`} />
          <KpiTile label="Reichweite" value={fmtInt(m.reach)} hint={`Frequenz ${fmtDec(m.frequency)}`} />
          <KpiTile label="Link-CTR" value={fmtPct(m.linkCtr)} />
          <KpiTile label="Link-Klicks" value={fmtInt(m.linkClicks)} />
        </section>

        <AdTable ads={ads} />

        {termine && termine.unmatched > 0 && (
          <p className="text-sm text-p8-navy/60">
            {termine.unmatched} {termine.unmatched === 1 ? "Termin konnte" : "Termine konnten"} keiner Anzeige zugeordnet werden
            (Anzeigenname in der Lead-Liste stimmt mit keiner Anzeige überein).
          </p>
        )}
      </main>
    </>
  );
}
