// Converts Ads Manager CSV exports into JSON shaped like Meta Marketing API
// responses, so the app runs the same parsing code in mock and live mode.
//
// Usage: node scripts/csv-to-mock.mjs [adsets.csv] [ads.csv] [out.json]
// Defaults: data/raw/adsets.csv data/raw/ads.csv data/mock/mister-marketing.json

import fs from "node:fs";
import path from "node:path";

const [adsetCsv = "data/raw/adsets.csv", adCsv = "data/raw/ads.csv", outFile = "data/mock/mister-marketing.json"] =
  process.argv.slice(2);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((v) => v !== "")) rows.push(row); }
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

// Ads Manager "Result indicator" looks like "actions:leadgen.other".
function actionType(row) {
  const ind = row["Result indicator"] || "";
  return ind.startsWith("actions:") ? ind.slice("actions:".length) : ind || null;
}

function insights(row) {
  const impressions = Number(row["Impressions"] || 0);
  const ctr = Number(row["CTR (link click-through rate)"] || 0);
  const type = actionType(row);
  const results = row["Results"];
  return {
    date_start: row["Reporting starts"],
    date_stop: row["Reporting ends"],
    spend: row["Amount spent (EUR)"] || "0",
    impressions: String(impressions),
    reach: row["Reach"] || "0",
    frequency: row["Frequency"] || "0",
    cpm: row["CPM (cost per 1,000 impressions) (EUR)"] || "0",
    inline_link_click_ctr: row["CTR (link click-through rate)"] || "0",
    // Not in the export: derived from CTR x impressions.
    inline_link_clicks: String(Math.round((impressions * ctr) / 100)),
    actions: type && results ? [{ action_type: type, value: results }] : [],
    cost_per_action_type: type && row["Cost per results"] ? [{ action_type: type, value: row["Cost per results"] }] : [],
  };
}

const adsets = parseCsv(fs.readFileSync(adsetCsv, "utf8")).map((r) => ({
  id: r["Ad set ID"],
  name: r["Ad set name"],
  effective_status: (r["Ad set delivery"] || "").toUpperCase(),
  // Meta returns budgets in cents as strings.
  daily_budget: r["Ad set budget type"] === "Daily" ? String(Math.round(Number(r["Ad set budget"]) * 100)) : null,
  lifetime_budget: r["Ad set budget type"] === "Lifetime" ? String(Math.round(Number(r["Ad set budget"]) * 100)) : null,
  insights: insights(r),
}));

const ads = parseCsv(fs.readFileSync(adCsv, "utf8")).map((r) => ({
  id: r["Ad ID"],
  name: r["Ad name"],
  adset_id: r["Ad set ID"],
  effective_status: (r["Ad delivery"] || "").toUpperCase(),
  thumbnail_url: null,
  insights: insights(r),
}));

const first = adsets[0]?.insights;
const out = {
  _note: "Generated from Ads Manager CSV exports by scripts/csv-to-mock.mjs. inline_link_clicks is derived from CTR x impressions.",
  date_start: first?.date_start,
  date_stop: first?.date_stop,
  adsets,
  ads,
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${outFile}: ${adsets.length} ad sets, ${ads.length} ads (${out.date_start} to ${out.date_stop})`);
