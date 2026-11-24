import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, sheetUrl } from "@/config/clients";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer, Panel, Status, Th, sourceLabel, td } from "@/components/ui";
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

  return (
    <>
      <Header client={client} range={range} rangeLocked={!!fixed} />
      <main className="mx-auto max-w-[1320px] space-y-6 px-6 py-8 lg:px-10">
        <Hero
          data={{ impressions: totals.impressions, linkClicks: totals.linkClicks, leads: totals.leads, termine: totals.termine, spend: totals.spend }}
          budget={totals.dailyBudget}
          range={range}
          mock={!!fixed}
        />

        <Panel title="Kampagnen" note="Klick auf eine Kampagne zeigt ihre einzelnen Anzeigen.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-line">
                <tr>
                  <Th label="Kampagne" align="left" />
                  <Th label="Leads" />
                  <Th label="Kosten pro Lead" />
                  <Th label="Termine" sub="laut Lead-Liste" />
                  <Th label="Terminquote" sub="Termine / Leads" />
                  <Th label="Ausgegeben" />
                  <Th label="Tagesbudget" />
                  <Th label="Link-CTR" sub="Klicks / Impressionen" />
                  <Th label="Lead-Liste" />
                </tr>
              </thead>
              <tbody className="tabular">
                {rows.map((r) => {
                  const sheet = client.groups.find((g) => g.slug === r.slug)?.leadSheet;
                  return (
                    <tr key={r.slug} className="border-b border-line last:border-0">
                      <td className={td}>
                        <Link
                          href={`/${client.slug}/${r.slug}${qs ? `?${qs}` : ""}`}
                          className="font-semibold text-plum-deep underline decoration-plum/30 underline-offset-4 hover:decoration-plum"
                        >
                          {r.label}
                        </Link>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-muted">{r.metaName}</span>
                          <Status status={r.status} />
                        </div>
                      </td>
                      <td className={`${td} text-right`}>{fmtInt(r.metrics.leads)}</td>
                      <td className={`${td} text-right`}>{fmtEur(r.metrics.costPerLead)}</td>
                      <td className={`${td} text-right`}>{fmtInt(r.termine)}</td>
                      <td className={`${td} text-right`}>{fmtPct(rate(r.termine, r.metrics.leads))}</td>
                      <td className={`${td} text-right`}>{fmtEur(r.metrics.spend)}</td>
                      <td className={`${td} text-right`}>{fmtEur(r.dailyBudget)}</td>
                      <td className={`${td} text-right`}>{fmtPct(r.metrics.linkCtr)}</td>
                      <td className={`${td} text-right`}>
                        {sheet ? (
                          <a href={sheetUrl(sheet)} target="_blank" rel="noreferrer" className="text-plum-deep hover:underline">
                            Öffnen
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {rows.length > 1 && (
                <tfoot className="tabular border-t-2 border-ink bg-page/70 font-semibold">
                  <tr>
                    <td className={td}>Gesamt</td>
                    <td className={`${td} text-right`}>{fmtInt(totals.leads)}</td>
                    <td className={`${td} text-right`}>{fmtEur(totals.costPerLead)}</td>
                    <td className={`${td} text-right`}>{fmtInt(totals.termine)}</td>
                    <td className={`${td} text-right`}>{fmtPct(totals.terminRate)}</td>
                    <td className={`${td} text-right`}>{fmtEur(totals.spend)}</td>
                    <td className={`${td} text-right`}>{fmtEur(totals.dailyBudget)}</td>
                    <td className={`${td} text-right`}>{fmtPct(totals.linkCtr)}</td>
                    <td className={td} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Panel>
      </main>
      <Footer source={sourceLabel(!!fixed, termineSource)} />
    </>
  );
}
