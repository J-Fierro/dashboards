import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getGroup } from "@/config/clients";
import { AdTable } from "@/components/AdTable";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer, Panel, Status, sourceLabel } from "@/components/ui";
import { getGroupDetail } from "@/lib/dashboard";
import { resolveRange } from "@/lib/dates";
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

  return (
    <>
      <Header client={client} range={range} rangeLocked={!!fixed} />
      <main className="mx-auto max-w-[1320px] space-y-6 px-6 py-8 lg:px-10">
        <div>
          <Link href={`/${client.slug}${qs ? `?${qs}` : ""}`} className="text-sm text-muted hover:text-ink">
            Alle Kampagnen
          </Link>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{row.label}</h1>
            <span className="text-sm text-muted">{row.metaName}</span>
            <Status status={row.status} />
          </div>
        </div>

        <Hero
          data={{ impressions: m.impressions, linkClicks: m.linkClicks, leads: m.leads, termine: row.termine, spend: m.spend }}
          budget={row.dailyBudget}
          range={range}
          mock={!!fixed}
        />

        <Panel
          title="Anzeigen"
          note={
            termine && termine.unmatched > 0
              ? `${termine.unmatched} ${termine.unmatched === 1 ? "Termin passt" : "Termine passen"} zu keiner Anzeige: Der Anzeigenname in der Lead-Liste weicht ab.`
              : "Sortieren mit Klick auf eine Spaltenüberschrift."
          }
        >
          <AdTable ads={ads} total={m} totalTermine={row.termine} />
        </Panel>
      </main>
      <Footer source={sourceLabel(!!fixed, termine?.source ?? "none")} />
    </>
  );
}
