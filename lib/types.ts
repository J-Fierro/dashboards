// Raw shapes as the Meta Marketing API returns them (numbers as strings).
export interface MetaAction {
  action_type: string;
  value: string;
}

export interface MetaInsights {
  date_start?: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  cpm?: string;
  inline_link_click_ctr?: string;
  inline_link_clicks?: string;
  actions?: MetaAction[];
  cost_per_action_type?: MetaAction[];
}

// Normalized metrics the UI works with.
export interface Metrics {
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  cpm: number;
  linkCtr: number; // percent, e.g. 1.3 = 1.3 %
  linkClicks: number;
  leads: number;
  costPerLead: number | null;
}

export interface GroupRow {
  slug: string;
  label: string;
  metaName: string;
  status: string;
  dailyBudget: number | null; // EUR
  metrics: Metrics;
  termine: number | null;
  purchases: number | null;
}

export interface AdRow {
  id: string;
  name: string;
  status: string;
  thumbnailUrl: string | null;
  metrics: Metrics;
  termine: number;
}

export interface DateRange {
  since: string; // yyyy-mm-dd
  until: string; // yyyy-mm-dd
}

export interface TermineResult {
  total: number;
  byAd: Map<string, number>; // Meta ad ID -> count
  unmatched: number;
  purchases: number | null; // "gekauft" = JA; null if the sheet has no gekauft column
  source: "sheet" | "fixture" | "none";
}
