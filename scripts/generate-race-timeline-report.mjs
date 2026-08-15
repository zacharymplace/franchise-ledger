import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "examples/example-race-timeline.json");
const mapPath = path.join(root, "data/franchise-map.json");
const outputPath = path.join(root, "reports/example-race-timeline-report.md");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(inputPath)) {
  fail("Missing example race timeline input.");
}

if (!fs.existsSync(mapPath)) {
  fail("Missing franchise map.");
}

const input = readJson(inputPath);
const map = readJson(mapPath);
const franchiseNames = new Map((map.franchises || []).map((franchise) => [franchise.id, franchise.name]));

if (input.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (!["legacy", "current", "momentum", "composite"].includes(input.metric)) {
  fail("metric must be legacy, current, momentum, or composite.");
}

if (!Array.isArray(input.points) || input.points.length === 0) {
  fail("points must be a non-empty array.");
}

const seenPointKeys = new Set();
const seasons = new Set();
const franchises = new Set();

for (const point of input.points) {
  if (!Number.isInteger(point.season) || point.season < 1871) {
    fail("Each point.season must be an integer >= 1871.");
  }

  if (!franchiseNames.has(point.franchiseId)) {
    fail("Unknown franchiseId: " + point.franchiseId);
  }

  if (typeof point.score !== "number" || point.score < 0 || point.score > 100) {
    fail("Each point.score must be a number from 0 to 100.");
  }

  const key = point.season + ":" + point.franchiseId;
  if (seenPointKeys.has(key)) {
    fail("Duplicate race point: " + key);
  }

  seenPointKeys.add(key);
  seasons.add(point.season);
  franchises.add(point.franchiseId);
}

const seasonList = [...seasons].sort((a, b) => a - b);
const franchiseList = [...franchises].sort();

for (const franchiseId of franchiseList) {
  for (const season of seasonList) {
    const key = season + ":" + franchiseId;
    if (!seenPointKeys.has(key)) {
      fail("Missing race point for " + franchiseId + " in " + season + ".");
    }
  }
}

const pointsBySeason = new Map();

for (const season of seasonList) {
  pointsBySeason.set(
    season,
    input.points
      .filter((point) => point.season === season)
      .sort((a, b) => b.score - a.score)
  );
}

const firstSeason = seasonList[0];
const lastSeason = seasonList[seasonList.length - 1];

const firstScores = new Map(pointsBySeason.get(firstSeason).map((point) => [point.franchiseId, point.score]));
const lastScores = new Map(pointsBySeason.get(lastSeason).map((point) => [point.franchiseId, point.score]));

const movement = franchiseList
  .map((franchiseId) => ({
    franchiseId,
    name: franchiseNames.get(franchiseId),
    firstScore: firstScores.get(franchiseId),
    lastScore: lastScores.get(franchiseId),
    delta: lastScores.get(franchiseId) - firstScores.get(franchiseId)
  }))
  .sort((a, b) => b.delta - a.delta);

const lines = [];

lines.push("# Franchise Ledger Example Race Timeline Report");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("- Schema version: " + input.schemaVersion);
lines.push("- Metric: " + input.metric);
lines.push("- Generated at: " + input.generatedAt);
lines.push("- Dataset type: illustrative example timeline data");
lines.push("");
lines.push("## Timeline Coverage");
lines.push("");
lines.push("- Seasons: " + seasonList.join(", "));
lines.push("- Franchises: " + franchiseList.length);
lines.push("- Points: " + input.points.length);
lines.push("");
lines.push("## Final Season Leaderboard");
lines.push("");
lines.push("| Rank | Franchise | Score |");
lines.push("|---:|---|---:|");

pointsBySeason.get(lastSeason).forEach((point, index) => {
  lines.push("| " + (index + 1) + " | " + franchiseNames.get(point.franchiseId) + " | " + point.score + " |");
});

lines.push("");
lines.push("## Full-Window Movement");
lines.push("");
lines.push("| Franchise | " + firstSeason + " | " + lastSeason + " | Delta |");
lines.push("|---|---:|---:|---:|");

for (const row of movement) {
  const signedDelta = row.delta > 0 ? "+" + row.delta : String(row.delta);
  lines.push("| " + row.name + " | " + row.firstScore + " | " + row.lastScore + " | " + signedDelta + " |");
}

lines.push("");
lines.push("## Race Frames");
lines.push("");

for (const season of seasonList) {
  lines.push("### " + season);
  lines.push("");
  pointsBySeason.get(season).forEach((point, index) => {
    lines.push(
      (index + 1) +
        ". " +
        franchiseNames.get(point.franchiseId) +
        " — " +
        point.score
    );
  });
  lines.push("");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n") + "\n");

console.log("Wrote " + path.relative(root, outputPath));
