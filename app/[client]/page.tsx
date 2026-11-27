import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, sheetUrl } from "@/config/clients";
import { ConversionPath } from "@/components/ConversionPath";
import { Header } from "@/components/Header";
import { SourceBadges, sourceLabel } from "@/components/SourceBadges";
import { Footer, KpiCard, Panel, Status, Th } from "@/components/ui";
import { getOverview } from "@/lib/dashboard";
import { resolveRange } from "@/lib/dates";
import { fmtEur, fmtInt, fmtPct } from "@/lib/format";
import { fixedRange } from "@/lib/sources";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ client: string }>;
  searchParams: Promise<{ preset?: string; since?: string; until?: string }>;
};

const rate = (t: number | null, l: number) => (t != null && l > 0 ? (t / l) * 100 : null);

export default async function ClientOverview({ params, searchParams }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const sp = await searchParams;
  const fixed = fixedRange(client);
  const range = fixed ?? resolveRange(sp);
  const { rows, totals, termineSource } = await getOverview(client, range);
  const qs = new URLSearchParams(sp).toString();
  const subtitle = `P8 · ${client.name}`;
  const n = rows.length;

  return (
    <>
      <Header subtitle={subtitle} range={range} rangeLocked={!!fixed} />
      <main className="mx-auto max-w-[1440px] space-y-5 px-6 py-6 lg:px-10">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Ausgegeben"
            value={fmtEur(totals.spend)}
            sub={totals.dailyBudget != null ? `Tagesbudget ${fmtEur(totals.dailyBudget)}` : undefined}
            accent="emerald"
          />
          <KpiCard label="Kosten pro Lead" value={fmtEur(totals.costPerLead)} sub={`${fmtInt(totals.leads)} Leads`} accent="violet" />
          <KpiCard label="Kosten pro Termin" value={fmtEur(totals.costPerTermin)} sub={`${fmtInt(totals.termine)} Termine`} accent="fuchsia" />
          <KpiCard label="Ø CPM" value={fmtEur(totals.cpm)} sub="Kosten pro 1.000 Impressionen" accent="amber" />
        </section>

        <Panel title="Conversion-Pfad" subtitle={totals.purchases != null ? "Von der Impression bis zum Kauf" : "Von der Impression bis zum gebuchten Termin"}>
          <ConversionPath data={{ impressions: totals.impressions, linkClicks: totals.linkClicks, leads: totals.leads, termine: totals.termine, purchases: totals.purchases }} />
        </Panel>

        <Panel
          title="Kampagnen-Übersicht"
          subtitle={
            <>
              {n} {n === 1 ? "Kampagne" : "Kampagnen"} · Meta Ads + Google Sheets ·{" "}
              <span className="text-violet">Kampagne anklicken für Details</span>
            </>
          }
          badges={<SourceBadges mock={!!fixed} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-line bg-page/60">
                <tr>
                  <Th label="Kampagne" align="left" />
                  <Th label="Leads" />
                  <Th label="Kosten / Ergebnis" sub="€ pro Lead" />
                  <Th label="Termine" sub="Terminbuchungen" />
                  <Th label="Terminquote" sub="Termine / Leads" />
                  <Th label="Budget" sub="€ täglich" />
                  <Th label="Ausgegeben" sub="€ im Zeitraum" />
                  <Th label="CTR (Link)" sub="Link-Klick-Rate" />
                  <Th label="Link-Klicks" />
                  <Th label="Leadliste" />
                </tr>
              </thead>
              <tbody className="tabular">
                {rows.map((r) => {
                  const sheet = client.groups.find((g) => g.slug === r.slug)?.leadSheet;
                  return (
                    <tr key={r.slug} className="border-b border-line last:border-0 hover:bg-page/50">
                      <td className="px-3 py-3.5">
                        <Link href={`/${client.slug}/${r.slug}${qs ? `?${qs}` : ""}`} className="font-semibold hover:text-violet">
                          {r.label}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                          <span>{r.metaName}</span>
                          <Status status={r.status} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right">{fmtInt(r.metrics.leads)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtEur(r.metrics.costPerLead)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtInt(r.termine)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtPct(rate(r.termine, r.metrics.leads))}</td>
                      <td className="px-3 py-3.5 text-right">{fmtEur(r.dailyBudget)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtEur(r.metrics.spend)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtPct(r.metrics.linkCtr)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtInt(r.metrics.linkClicks)}</td>
                      <td className="px-3 py-3.5 text-right">
                        {sheet ? (
                          <a href={sheetUrl(sheet)} target="_blank" rel="noreferrer" className="text-violet hover:underline">
                            Öffnen ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="tabular bg-ink text-white">
                <tr className="font-semibold">
                  <td className="px-3 py-4">GESAMT</td>
                  <td className="px-3 py-4 text-right">{fmtInt(totals.leads)}</td>
                  <td className="px-3 py-4 text-right">{fmtEur(totals.costPerLead)}</td>
                  <td className="px-3 py-4 text-right">{fmtInt(totals.termine)}</td>
                  <td className="px-3 py-4 text-right">{fmtPct(totals.terminRate)}</td>
                  <td className="px-3 py-4 text-right">{fmtEur(totals.dailyBudget)}</td>
                  <td className="px-3 py-4 text-right">{fmtEur(totals.spend)}</td>
                  <td className="px-3 py-4 text-right">{fmtPct(totals.linkCtr)}</td>
                  <td className="px-3 py-4 text-right">{fmtInt(totals.linkClicks)}</td>
                  <td className="px-3 py-4" />
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      </main>
      <Footer subtitle={client.name} source={sourceLabel(!!fixed, termineSource)} />
    </>
  );
}
