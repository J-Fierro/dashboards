import "server-only";
import type { ClientConfig, GroupConfig } from "@/config/clients";
import { toMetrics } from "./metrics";
import { readLeadSheet } from "./sheets";
import { getAds, getGroup } from "./sources";
import { countTermine, normalizeAdName } from "./termine";
import type { AdRow, DateRange, GroupRow, TermineResult } from "./types";

async function termineFor(group: GroupConfig, range: DateRange, adNames: string[]): Promise<TermineResult | null> {
  if (!group.leadSheet) return null;
  const { values, source } = await readLeadSheet(group.leadSheet);
  return countTermine(values, range, adNames, source);
}

export async function getGroupDetail(client: ClientConfig, group: GroupConfig, range: DateRange) {
  const [data, ads] = await Promise.all([getGroup(client, group, range), getAds(client, group, range)]);
  const termine = await termineFor(group, range, ads.map((a) => a.name));

  const row: GroupRow = {
    slug: group.slug,
    label: group.label,
    metaName: data.name,
    status: data.status,
    dailyBudget: data.dailyBudget,
    metrics: toMetrics(data.insights, client.leadActionType),
    termine: termine?.total ?? null,
  };

  const adRows: AdRow[] = ads.map((ad) => ({
    id: ad.id,
    name: ad.name,
    status: ad.status,
    thumbnailUrl: ad.thumbnailUrl,
    metrics: toMetrics(ad.insights, client.leadActionType),
    termine: termine?.byAd.get(normalizeAdName(ad.name)) ?? 0,
  }));

  return { row, ads: adRows, termine };
}

export async function getOverview(client: ClientConfig, range: DateRange) {
  const details = await Promise.all(client.groups.map((g) => getGroupDetail(client, g, range)));
  const rows = details.map((d) => d.row);

  const sum = (f: (r: GroupRow) => number) => rows.reduce((acc, r) => acc + f(r), 0);
  const spend = sum((r) => r.metrics.spend);
  const leads = sum((r) => r.metrics.leads);
  const impressions = sum((r) => r.metrics.impressions);
  const linkClicks = sum((r) => r.metrics.linkClicks);
  const hasTermine = rows.some((r) => r.termine != null);
  const termine = sum((r) => r.termine ?? 0);

  // Reach and frequency are deduplicated per group, so they aren't summed.
  const totals = {
    spend,
    leads,
    costPerLead: leads > 0 ? spend / leads : null,
    impressions,
    linkClicks,
    linkCtr: impressions > 0 ? (linkClicks / impressions) * 100 : 0,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
    termine: hasTermine ? termine : null,
    costPerTermin: hasTermine && termine > 0 ? spend / termine : null,
    terminRate: hasTermine && leads > 0 ? (termine / leads) * 100 : null,
  };

  const termineSource = details.find((d) => d.termine)?.termine?.source ?? "none";
  return { rows, totals, termineSource };
}
