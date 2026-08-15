import fs from "node:fs";

const htmlPath = "dashboard/index.html";
const cssPath = "dashboard/styles.css";

const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!html) fail("Missing dashboard HTML.");
if (!css) fail("Missing dashboard CSS.");

const jsPath = "dashboard/app.js";
const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, "utf8") : "";

if (!js) fail("Missing dashboard JavaScript.");

const requiredJs = [
  "summary.leaderSnapshot.displayName",
  "race-dot-final",
  "summary.finalSeason",
  "summary.maxRank",
  "data.trackPoints",
  "data.summary",
  "data.finalStandings",
  "franchise.franchiseId",
  "franchise.displayName",
  "point.franchiseId",
  "point.displayName",
  "role",
  "tabindex",
  "aria-label",
  "keydown",
  "addEventListener",
  "point.compositeScore",
  "point.rank",
  "point.season",
  "title",
  "rankTicks",
  "viewBox",
  "text",
  "circle",
  "line",
  "svg",
  "http://www.w3.org/2000/svg",
  "createElementNS",
  "../exports/dashboard-summary.json",
  "../exports/race-horse-dashboard-data.json",
  "fetch",
  "renderRaceHorsePanel",
  "score-count",
  "season-count",
  "franchise-count",
  "race-point-count"
];

for (const snippet of requiredJs) {
  if (!js.includes(snippet)) {
    fail("Missing dashboard JS snippet: " + snippet);
  }
}

const requiredHtml = [
  "race-detail-meta",
  "race-detail-franchise",
  "race-marker-detail",
  "Franchise Ledger Dashboard",
  "Dashboard Scaffold",
  "Docs Check",
  "Artifact Check",
  "Drift Check",
  "Full Lahman",
  "Scoring Model",
  "Replay / Diff",
  "Generated Artifacts",
  "Full Dataset Gate",
  "Current Leader Snapshot",
  "score-count",
  "season-count",
  "franchise-count",
  "race-point-count",
  "comparison-report-status",
  "diff-report-status",
  "top-franchise",
  "race-horse-panel",
  "race-final-season",
  "race-track-points",
  "race-max-rank",
  "race-final-standings",
  "app.js",
  "Model Lifecycle",
  "Baseline",
  "Active",
  "Replay Diff",
  "Review",
  "Promote",
];

for (const snippet of requiredHtml) {
  if (!html.includes(snippet)) {
    fail("Missing dashboard HTML snippet: " + snippet);
  }
}

const requiredCss = [
  ".race-dot-final",
  "cursor: pointer",
  ".race-dot:focus",
  ".race-marker-detail",
  ".race-dot",
  ".race-label",
  ".race-tick",
  ".race-lane",
  ".race-svg",
  ".status-grid",
  ".panel-grid",
  ".status-card.pass",
  ".lifecycle-panel",
  ".lifecycle-steps",
  ".race-horse-panel",
  ".race-track",
  ".race-row",
  ".race-marker",
  ".standings-list",
  "@media"
];

for (const snippet of requiredCss) {
  if (!css.includes(snippet)) {
    fail("Missing dashboard CSS snippet: " + snippet);
  }
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger dashboard scaffold is valid.");
}
