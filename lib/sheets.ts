import "server-only";
import { JWT } from "google-auth-library";
import type { LeadSheet } from "@/config/clients";
import mmLeads from "@/data/fixtures/mister-marketing-leads.json";

const FIXTURES: Record<string, { values: string[][] }> = {
  "mister-marketing-leads.json": mmLeads,
};

let jwt: JWT | null = null;

function auth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  jwt ??= new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  return jwt;
}

/** Returns the sheet as rows of strings, header first. */
export async function readLeadSheet(sheet: LeadSheet): Promise<{ values: string[][]; source: "sheet" | "fixture" | "none" }> {
  const client = auth();
  if (!client) {
    const fixture = sheet.fixture ? FIXTURES[sheet.fixture] : undefined;
    return fixture ? { values: fixture.values, source: "fixture" } : { values: [], source: "none" };
  }
  const { token } = await client.getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheet.spreadsheetId}/values/${encodeURIComponent(sheet.range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Google Sheets ${sheet.spreadsheetId}: ${res.status}. Is the sheet shared with ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}?`);
  }
  const body = (await res.json()) as { values?: string[][] };
  return { values: body.values ?? [], source: "sheet" };
}
