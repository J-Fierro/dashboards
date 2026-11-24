import type { MetaAction, MetaInsights, Metrics } from "./types";

const FALLBACK_LEAD_TYPES = ["onsite_conversion.lead_grouped", "lead", "leadgen_grouped", "leadgen.other"];

const num = (v?: string) => (v ? Number(v) : 0);

// Pick exactly one lead action type so overlapping types aren't double counted.
function pickAction(list: MetaAction[] | undefined, preferred?: string) {
  if (!list?.length) return undefined;
  const order = preferred ? [preferred, ...FALLBACK_LEAD_TYPES] : FALLBACK_LEAD_TYPES;
  for (const type of order) {
    const hit = list.find((a) => a.action_type === type);
    if (hit) return hit;
  }
  return undefined;
}

export function toMetrics(raw: MetaInsights | undefined, leadActionType?: string): Metrics {
  const i = raw ?? {};
  const leads = num(pickAction(i.actions, leadActionType)?.value);
  const spend = num(i.spend);
  return {
    spend,
    impressions: num(i.impressions),
    reach: num(i.reach),
    frequency: num(i.frequency),
    cpm: num(i.cpm),
    linkCtr: num(i.inline_link_click_ctr),
    linkClicks: num(i.inline_link_clicks),
    leads,
    costPerLead: leads > 0 ? spend / leads : null,
  };
}

export function emptyMetrics(): Metrics {
  return { spend: 0, impressions: 0, reach: 0, frequency: 0, cpm: 0, linkCtr: 0, linkClicks: 0, leads: 0, costPerLead: null };
}
