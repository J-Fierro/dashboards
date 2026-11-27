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

1. Put a token with `ads_read` in Vercel as `META_ACCESS_TOKEN`. For testing a long-lived user token works (it expires after ~60 days); for production use a System User token from P8's business portfolio, which doesn't expire.
2. In Vercel, set `DATA_SOURCE=meta` and redeploy.
3. Each client needs `adAccountId` in `config/clients.ts`, and each group a hardcoded `metaId` (ad set or campaign ID). Never match by name: Meta allows several ad sets with the same name.

Leads are counted from one action type per client (`leadActionType`, default `onsite_conversion.lead_grouped` = Instant Form leads, which is what Ads Manager shows as "Results"). The API code is in `lib/sources/meta.ts`. Requests are cached for 5 minutes.

### Lead sheets

Share each lead sheet with the service account's email (Viewer is enough). Columns are found by header name, so their order doesn't matter. The dashboard reads only:

- `Datum`: only leads inside the selected date range count
- `Terminbuchung`: `JA` counts as one Termin
- `Ad-ID`: the Meta ad ID the lead came from. This is what assigns a Termin to an ad. The lead form automation should write it for every new lead (it's `ad_id` in the Meta lead payload).
- `Ad`: fallback for rows without an Ad-ID. The name is only used when exactly one ad in the group has it (copy suffixes like "- Kopie" are ignored); otherwise the Termin counts as unmatched.

Termine that can't be assigned are shown as "nicht zugeordnet" on the campaign page. They still count in the totals.

## Login

Passwords are environment variables in Vercel (Settings → Environment Variables), so they can be looked up and changed there:

| Variable | Opens |
|---|---|
| `ADMIN_PASSWORD` | every dashboard and the client list at `/` (P8 team) |
| `PASSWORD_<CLIENT_SLUG>` | only that client's pages, e.g. `PASSWORD_MISTER_MARKETING` for `/mister-marketing` |

The slug is upper-cased and `-` becomes `_`. A client without its variable can't log in; only the admin can open it. After adding or changing a password, redeploy so it takes effect. Changing a password logs out everyone who used the old one.

After login, a signed HTTP-only cookie keeps the browser logged in. It is renewed on every visit and only expires after 90 days without a visit. "Abmelden" in the header logs out.

`SESSION_SECRET` (optional) is mixed into the cookie signature. Changing it logs everyone out.

## Adding a client

Add an entry to `config/clients.ts` and a `PASSWORD_<SLUG>` variable in Vercel. Each group is one row on the overview: a Meta campaign (`level: "campaign"`) or a single ad set (`level: "adset"`), optionally with its own lead sheet.

## Structure

```
config/clients.ts       clients, groups, lead sheets
lib/sources/            mock.ts (CSV JSON) and meta.ts (live API), same output shape
lib/metrics.ts          Meta insights -> normalized metrics
lib/termine.ts          Termine counting and ad matching (Ad-ID, name fallback)
lib/sheets.ts           Google Sheets reader
lib/dashboard.ts        combines everything per page
app/[client]/           overview
app/[client]/[group]/   campaign drill-down with ad table
scripts/csv-to-mock.mjs Ads Manager CSV -> mock JSON
```
