# P8 Ads Dashboard

Client dashboards for Meta lead campaigns: performance from Meta, booked appointments (Termine) from the client's Google Sheets lead list.

Next.js (App Router), Tailwind, deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000/mister-marketing

## Data sources

| What | Where it comes from | Switch |
|---|---|---|
| Ad performance (leads, spend, reach, CTR, ...) | `DATA_SOURCE=mock`: `data/mock/*.json`, converted from Ads Manager CSV exports. `DATA_SOURCE=meta`: Meta Marketing API, live. | `DATA_SOURCE` |
| Termine | The group's lead sheet via a Google service account. Without credentials: `data/fixtures/*.json`. | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` |

### Refresh the mock data

1. In Ads Manager, export the ad set level and the ad level report as CSV.
2. Save them as `data/raw/adsets.csv` and `data/raw/ads.csv` (git-ignored).
3. `npm run mock`

The export has no link-click column, so the script derives link clicks from CTR × impressions.

### Going live with Meta

1. Get a System User token with `ads_read` on the ad account.
2. In Vercel, set `DATA_SOURCE=meta` and `META_ACCESS_TOKEN`.
3. Fill in `adAccountId` in `config/clients.ts`.

The API code is in `lib/sources/meta.ts`. Requests are cached for 5 minutes.

### Lead sheets

Share each lead sheet with the service account's email (Viewer is enough). Columns are found by header name, so their order doesn't matter. The dashboard reads only:

- `Datum`: only leads inside the selected date range count
- `Terminbuchung`: `JA` counts as one Termin
- `Ad`: assigns the Termin to an ad. Copy suffixes such as "- Kopie" or "(Copy 2)" are ignored when matching.

Termine whose ad name matches no ad are shown as "nicht zugeordnet" on the campaign page.

## Access

Each client opens their dashboard through a private link:

```
https://<domain>/<client-slug>?key=<ACCESS_CLIENT_SLUG>
```

The first visit replaces the key with a signed, HTTP-only cookie valid for 90 days and removes the key from the address bar. A client's cookie opens only that client's pages. `ADMIN_TOKEN` opens all dashboards and the client list at `/`.

Environment variables (generate each value with `openssl rand -hex 32`):

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | Signs the cookies. Without it, production denies everyone. |
| `ADMIN_TOKEN` | P8 team link: `https://<domain>/?key=...` |
| `ACCESS_MISTER_MARKETING` | Client link. One variable per client: `ACCESS_` + slug in capitals, dashes as underscores. |

To revoke a client's link, change their variable in Vercel and redeploy. Old links and existing cookies stop working. Changing `SESSION_SECRET` logs everyone out.

## Adding a client

Add an entry to `config/clients.ts` and an `ACCESS_<SLUG>` variable in Vercel. Each group is one row on the overview: a Meta campaign (`level: "campaign"`) or a single ad set (`level: "adset"`), optionally with its own lead sheet.

## Structure

```
config/clients.ts       clients, groups, lead sheets
lib/sources/            mock.ts (CSV JSON) and meta.ts (live API), same output shape
lib/metrics.ts          Meta insights -> normalized metrics
lib/termine.ts          Termine counting and ad-name matching
lib/sheets.ts           Google Sheets reader
lib/dashboard.ts        combines everything per page
app/[client]/           overview
app/[client]/[group]/   campaign drill-down with ad table
scripts/csv-to-mock.mjs Ads Manager CSV -> mock JSON
```
