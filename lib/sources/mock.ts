import type { ClientConfig, GroupConfig } from "@/config/clients";
import type { DateRange } from "../types";
import type { AdData, GroupData } from "./types";
import misterMarketing from "@/data/mock/mister-marketing.json";

// Static imports so Vercel bundles the files. Add new mock files here.
const MOCKS: Record<string, MockFile> = {
  "mister-marketing.json": misterMarketing as MockFile,
};

interface MockFile {
  date_start: string;
  date_stop: string;
  adsets: { id: string; name: string; effective_status: string; daily_budget: string | null; insights: GroupData["insights"] }[];
  ads: { id: string; name: string; adset_id: string; effective_status: string; thumbnail_url: string | null; insights: AdData["insights"] }[];
}

function load(client: ClientConfig): MockFile {
  const file = MOCKS[client.mockFile];
  if (!file) throw new Error(`Mock file ${client.mockFile} is not registered in lib/sources/mock.ts`);
  return file;
}

export function mockRange(client: ClientConfig): DateRange {
  const f = load(client);
  return { since: f.date_start, until: f.date_stop };
}

// The CSV export is one fixed period, so the date range is ignored here.
export async function getGroup(client: ClientConfig, group: GroupConfig): Promise<GroupData> {
  if (group.level !== "adset") throw new Error("Mock data only supports ad set groups (the CSV has no campaign IDs).");
  const adset = load(client).adsets.find((a) => a.id === group.metaId);
  if (!adset) throw new Error(`Ad set ${group.metaId} not found in ${client.mockFile}`);
  return {
    name: adset.name,
    status: adset.effective_status,
    dailyBudget: adset.daily_budget ? Number(adset.daily_budget) / 100 : null,
    insights: adset.insights,
  };
}

export async function getAds(client: ClientConfig, group: GroupConfig): Promise<AdData[]> {
  return load(client)
    .ads.filter((a) => a.adset_id === group.metaId)
    .map((a) => ({ id: a.id, name: a.name, status: a.effective_status, thumbnailUrl: a.thumbnail_url, insights: a.insights }));
}
