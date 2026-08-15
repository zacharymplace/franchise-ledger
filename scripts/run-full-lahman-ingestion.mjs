import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const teamsPath = "data/raw/lahman/full/Teams.csv";
const processedPath = path.join(root, "data/processed/lahman-season-records.json");
const processedFullPath = path.join(root, "data/processed/full/lahman-season-records.json");
const scoresPath = path.join(root, "exports/lahman-derived-season-scores.json");
const scoresFullPath = path.join(root, "exports/full/lahman-derived-season-scores.json");
const racePath = path.join(root, "exports/lahman-race-timeline.json");
const raceFullPath = path.join(root, "exports/full/lahman-race-timeline.json");
const scoreReportPath = path.join(root, "reports/lahman-derived-season-score-report.md");
const scoreReportFullPath = path.join(root, "reports/full/lahman-derived-season-score-report.md");
const raceReportPath = path.join(root, "reports/lahman-race-timeline-report.md");
const raceReportFullPath = path.join(root, "reports/full/lahman-race-timeline-report.md");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

if (!fs.existsSync(path.join(root, teamsPath))) {
  fail("Missing full Lahman Teams.csv. Run npm run download-lahman first.");
}

execFileSync("node", ["adapters/lahman-season-records-adapter.mjs", teamsPath], { stdio: "inherit" });
execFileSync("node", ["scripts/validate-lahman-season-records.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/score-lahman-season-records.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/validate-lahman-derived-season-scores.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/export-lahman-race-timeline.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/validate-lahman-race-timeline.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/generate-lahman-score-report.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/generate-lahman-race-report.mjs"], { stdio: "inherit" });

copyFile(processedPath, processedFullPath);
copyFile(scoresPath, scoresFullPath);
copyFile(racePath, raceFullPath);
copyFile(scoreReportPath, scoreReportFullPath);
copyFile(raceReportPath, raceReportFullPath);

console.log("Wrote full Lahman artifacts under data/processed/full, exports/full, and reports/full.");
