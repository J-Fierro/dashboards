// Live Meta Marketing API source: active when DATA_SOURCE=meta.
// Needs META_ACCESS_TOKEN with ads_read (user token for testing, System User token in production).
import "server-only";
import type { ClientConfig, GroupConfig } from "@/config/clients";
import type { DateRange, MetaInsights } from "../types";
import type { AdData, GroupData } from "./types";

const INSIGHT_FIELDS = [
  "spend",
  "impressions",
  "reach",
  "frequency",
  "cpm",
  "inline_link_clicks",
  "inline_link_click_ctr",
  "actions",
  "cost_per_action_type",
].join(",");

function base() {
  return `https://graph.facebook.com/${process.env.META_API_VERSION || "v27.0"}`;
}

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN is not set");
  const url = new URL(`${base()}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", token);
  // Cache identical requests for 5 minutes to stay well inside rate limits.
  const res = await fetch(url, { next: { revalidate: 300 } });
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(`Meta API ${path}: ${body.error?.message ?? res.statusText}`);
  }
  return body as T;
}

const timeRange = (r: DateRange) => JSON.stringify({ since: r.since, until: r.until });

export async function getGroup(client: ClientConfig, group: GroupConfig, range: DateRange): Promise<GroupData> {
  const [obj, ins] = await Promise.all([
    graph<{ name: string; effective_status: string; daily_budget?: string }>(group.metaId, {
      fields: "name,effective_status,daily_budget",
    }),
    graph<{ data: MetaInsights[] }>(`${group.metaId}/insights`, {
      fields: INSIGHT_FIELDS,
      time_range: timeRange(range),
    }),
  ]);
  return {
    name: obj.name,
    status: obj.effective_status,
    // Campaigns without campaign budget optimization have no daily_budget.
    dailyBudget: obj.daily_budget ? Number(obj.daily_budget) / 100 : null,
    insights: ins.data[0],
  };
}

export async function getAds(client: ClientConfig, group: GroupConfig, range: DateRange): Promise<AdData[]> {
  const [ads, ins] = await Promise.all([
    graph<{ data: { id: string; name: string; effective_status: string; creative?: { thumbnail_url?: string } }[] }>(
      `${group.metaId}/ads`,
      { fields: "id,name,effective_status,creative{thumbnail_url}", limit: "200" },
    ),
    graph<{ data: (MetaInsights & { ad_id: string })[] }>(`${group.metaId}/insights`, {
      level: "ad",
      fields: `ad_id,${INSIGHT_FIELDS}`,
      time_range: timeRange(range),
      limit: "200",
    }),
  ]);
  const byAd = new Map(ins.data.map((row) => [row.ad_id, row]));
  return ads.data.map((ad) => ({
    id: ad.id,
    name: ad.name,
    status: ad.effective_status,
    thumbnailUrl: ad.creative?.thumbnail_url ?? null,
    insights: byAd.get(ad.id),
  }));
}
