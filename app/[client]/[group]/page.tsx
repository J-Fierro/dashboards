import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getGroup } from "@/config/clients";
import { AdTable } from "@/components/AdTable";
import { ConversionPath } from "@/components/ConversionPath";
import { Header } from "@/components/Header";
import { SourceBadges, sourceLabel } from "@/components/SourceBadges";
import { Footer, KpiCard, Panel } from "@/components/ui";
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

  const sp = await searchParams;
  const fixed = fixedRange(client);
  const range = fixed ?? resolveRange(sp);
  const { row, ads, termine } = await getGroupDetail(client, group, range);
  const m = row.metrics;
  const qs = new URLSearchParams(sp).toString();
  const costPerTermin = row.termine ? m.spend / row.termine : null;
  const terminRate = row.termine != null && m.leads > 0 ? (row.termine / m.leads) * 100 : null;

  return (
    <>
      <Header subtitle={`P8 · ${client.name} · ${row.label}`} range={range} rangeLocked={!!fixed} />
      <main className="mx-auto max-w-[1440px] space-y-5 px-6 py-6 lg:px-10">
        <Link href={`/${client.slug}${qs ? `?${qs}` : ""}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          ← Zurück zur Übersicht
        </Link>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Ausgegeben"
            value={fmtEur(m.spend)}
            sub={row.dailyBudget != null ? `Tagesbudget ${fmtEur(row.dailyBudget)}` : undefined}
            accent="emerald"
          />
          <KpiCard label="Kosten pro Lead" value={fmtEur(m.costPerLead)} sub={`${fmtInt(m.leads)} Leads`} accent="violet" />
          <KpiCard label="Kosten pro Termin" value={fmtEur(costPerTermin)} sub={`Terminquote ${fmtPct(terminRate)}`} accent="fuchsia" />
          <KpiCard label="Reichweite" value={fmtInt(m.reach)} sub={`Frequenz ${fmtDec(m.frequency)}`} accent="amber" />
        </section>

        <Panel title="Conversion-Pfad" subtitle="Von der Impression bis zum gebuchten Termin">
          <ConversionPath data={{ impressions: m.impressions, linkClicks: m.linkClicks, leads: m.leads, termine: row.termine }} />
        </Panel>

        <Panel
          title={`${row.label} · Anzeigen`}
          subtitle={
            <>
              {ads.length} Anzeigen · {row.metaName} · <span className="text-violet">Zum Sortieren auf einen Spaltentitel klicken</span>
            </>
          }
          badges={<SourceBadges mock={!!fixed} />}
        >
          <AdTable ads={ads} total={m} totalTermine={row.termine} />
        </Panel>

        {termine && termine.unmatched > 0 && (
          <p className="text-xs text-muted">
            {termine.unmatched} {termine.unmatched === 1 ? "Termin konnte" : "Termine konnten"} keiner Anzeige zugeordnet werden. Die
            Ad-ID in der Lead-Liste fehlt oder gehört zu keiner Anzeige dieser Kampagne.
          </p>
        )}
      </main>
      <Footer subtitle={`${client.name} · ${row.label}`} source={sourceLabel(!!fixed, termine?.source ?? "none")} />
    </>
  );
}
