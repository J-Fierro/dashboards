// One entry per client dashboard. A "group" is one row on the overview page:
// a Meta campaign or a single ad set, depending on how the client is set up.

export type GroupLevel = "campaign" | "adset";

export interface LeadSheet {
  spreadsheetId: string;
  /** A1 range covering the header row and all data, e.g. "Tabellenblatt1!A:M" */
  range: string;
  /** Local fallback used when no Google service account is configured. */
  fixture?: string;
}

export interface GroupConfig {
  slug: string;
  label: string;
  level: GroupLevel;
  metaId: string;
  leadSheet?: LeadSheet;
}

export interface ClientConfig {
  slug: string;
  name: string;
  adAccountId: string;
  /** Mock file in data/mock, used when DATA_SOURCE=mock. */
  mockFile: string;
  /** Meta action type counted as a lead. Falls back to common lead types. */
  leadActionType?: string;
  groups: GroupConfig[];
}

export const clients: ClientConfig[] = [
  {
    slug: "mister-marketing",
    name: "Mister Marketing",
    adAccountId: "act_TODO", // fill in once API access exists
    mockFile: "mister-marketing.json",
    leadActionType: "leadgen.other",
    groups: [
      {
        slug: "kampagne-1",
        label: "Kampagne 1",
        level: "adset",
        metaId: "120253887576570169", // ad set "Neue Videos - Copy"
        leadSheet: {
          spreadsheetId: "1xoxjJs9KPhmOdbBFqx2mdwDZ-Yx8vihVFUKiBr2G1Y4",
          range: "Tabellenblatt1!A:M",
          fixture: "mister-marketing-leads.json",
        },
      },
    ],
  },
];

export function getClient(slug: string) {
  return clients.find((c) => c.slug === slug);
}

export function sheetUrl(sheet: LeadSheet) {
  return `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`;
}

export function getGroup(client: ClientConfig, slug: string) {
  return client.groups.find((g) => g.slug === slug);
}
