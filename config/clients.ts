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
  /** Login password as a scrypt hash: npm run hash-password -- "password" */
  passwordHash?: string;
  /** Meta action type counted as a lead. Falls back to common lead types. */
  leadActionType?: string;
  groups: GroupConfig[];
}

/** P8 team password: opens every dashboard and the client list. */
export const adminPasswordHash: string | undefined = "scrypt$9bf7a989fe6ba9c27f095a3e35d8067d$a2e9d8ccc8d4d06860a44f73580d39ac7eb67cd618911db04b35874e48c31c1e";

export const clients: ClientConfig[] = [
  {
    slug: "mister-marketing",
    name: "Mister Marketing",
    adAccountId: "act_TODO", // fill in once API access exists
    mockFile: "mister-marketing.json",
    passwordHash: "scrypt$3100cb14c432f6be3711eb9b0fe91701$51dee954f9239fe62ae6f8efc9b5efe6231c161ef253c2fb0c55ed4158f66882",
    leadActionType: "leadgen.other",
    groups: [
      {
        slug: "kampagne-1",
        label: "Kampagne 1",
        level: "adset",
        metaId: "120253887576570169", // ad set "Neue Videos - Copy"
        leadSheet: {
          spreadsheetId: "1EkIGcwdqHn_klxyxV_gcSqw0mpMZL6zMkFLvn77FQss",
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
