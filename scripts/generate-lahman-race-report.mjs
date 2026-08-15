import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "exports/lahman-race-timeline.json");
const outputPath = path.join(root, "reports/lahman-race-timeline-report.md");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(inputPath)) {
  fail("Missing Lahman race timeline export.");
}

const input = readJson(inputPath);

if (!Array.isArray(input.frames) || input.frames.length === 0) {
  fail("frames must be a non-empty array.");
}

const seasons = [...input.seasons].sort((a, b) => a - b);
const firstSeason = seasons[0];
const lastSeason = seasons[seasons.length - 1];
const finalFrame = input.frames.find((frame) => frame.season === lastSeason);

const lines = [];

lines.push("# Franchise Ledger Lahman Race Timeline Report");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("- Schema version: " + input.schemaVersion);
lines.push("- Generated at: " + input.generatedAt);
lines.push("- Source: " + input.source);
lines.push("- Chart type: " + input.chartType);
lines.push("- Metric: " + input.metric);
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push("- Seasons covered: " + seasons.join(", "));
lines.push("- Race points: " + input.points.length);
lines.push("- Frames: " + input.frames.length);
lines.push("- First season: " + firstSeason);
lines.push("- Final season: " + lastSeason);
lines.push("");
lines.push("## Final Frame");
lines.push("");
lines.push("| Rank | Franchise | Score | Grade |");
lines.push("|---:|---|---:|---:|");

for (const row of finalFrame.standings) {
  lines.push("| " + row.rank + " | " + row.name + " | " + row.score + " | " + row.grade + " |");
}

lines.push("");
lines.push("## Race Frames");
lines.push("");

for (const frame of input.frames) {
  lines.push("### " + frame.season);
  lines.push("");

  for (const row of frame.standings) {
    lines.push(row.rank + ". " + row.name + " — " + row.score + " (" + row.grade + ")");
  }

  lines.push("");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
lines.push("## Data Caveat");
lines.push("");
lines.push("This report is generated from the committed illustrative Lahman-shaped example dataset. It validates the Franchise Ledger pipeline but is not authoritative historical analysis.");
lines.push("");
fs.writeFileSync(outputPath, lines.join("\n") + "\n");

console.log("Wrote " + path.relative(root, outputPath));
