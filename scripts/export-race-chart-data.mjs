import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "examples/example-race-timeline.json");
const mapPath = path.join(root, "data/franchise-map.json");
const outputPath = path.join(root, "exports/example-race-chart-data.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(inputPath)) fail("Missing race timeline input.");
if (!fs.existsSync(mapPath)) fail("Missing franchise map.");

const input = readJson(inputPath);
const map = readJson(mapPath);
const franchiseNames = new Map((map.franchises || []).map((franchise) => [franchise.id, franchise.name]));

if (!Array.isArray(input.points) || input.points.length === 0) {
  fail("Race timeline points must be a non-empty array.");
}

const seasons = [...new Set(input.points.map((point) => point.season))].sort((a, b) => a - b);
const franchiseIds = [...new Set(input.points.map((point) => point.franchiseId))].sort();

const scoreByKey = new Map();

for (const point of input.points) {
  if (!franchiseNames.has(point.franchiseId)) {
    fail("Unknown franchiseId: " + point.franchiseId);
  }

  scoreByKey.set(point.season + ":" + point.franchiseId, point.score);
}

const series = franchiseIds.map((franchiseId) => ({
  franchiseId,
  name: franchiseNames.get(franchiseId),
  points: seasons.map((season) => {
    const key = season + ":" + franchiseId;

    if (!scoreByKey.has(key)) {
      fail("Missing score for " + franchiseId + " in " + season + ".");
    }

    return {
      season,
      score: scoreByKey.get(key)
    };
  })
}));

const frames = seasons.map((season) => {
  const standings = franchiseIds
    .map((franchiseId) => ({
      franchiseId,
      name: franchiseNames.get(franchiseId),
      score: scoreByKey.get(season + ":" + franchiseId)
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({
      rank: index + 1,
      ...row
    }));

  return {
    season,
    standings
  };
});

const output = {
  schemaVersion: "0.1",
  generatedAt: input.generatedAt,
  source: "examples/example-race-timeline.json",
  chartType: "race-timeline",
  metric: input.metric,
  seasons,
  series,
  frames
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("Wrote " + path.relative(root, outputPath));
