import type { MetaInsights } from "../types";

export interface GroupData {
  name: string;
  status: string;
  dailyBudget: number | null; // EUR
  insights: MetaInsights | undefined;
}

export interface AdData {
  id: string;
  name: string;
  status: string;
  thumbnailUrl: string | null;
  insights: MetaInsights | undefined;
}
