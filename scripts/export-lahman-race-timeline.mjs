import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "exports/lahman-derived-season-scores.json");
const mapPath = path.join(root, "data/franchise-map.json");
const outputPath = path.join(root, "exports/lahman-race-timeline.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(inputPath)) fail("Missing Lahman-derived season scores.");
if (!fs.existsSync(mapPath)) fail("Missing franchise map.");

const input = readJson(inputPath);
const map = readJson(mapPath);
const franchiseNames = new Map((map.franchises || []).map((franchise) => [franchise.id, franchise.name]));

const points = input.scores.map((row) => ({
  season: row.season,
  franchiseId: row.franchiseId,
  name: franchiseNames.get(row.franchiseId) || row.franchiseId,
  score: row.scores.composite,
  grade: row.grade
}));

const seasons = [...new Set(points.map((point) => point.season))].sort((a, b) => a - b);

const frames = seasons.map((season) => ({
  season,
  standings: points
    .filter((point) => point.season === season)
    .sort((a, b) => b.score - a.score)
    .map((point, index) => ({
      rank: index + 1,
      franchiseId: point.franchiseId,
      name: point.name,
      score: point.score,
      grade: point.grade
    }))
}));

const output = {
  schemaVersion: "0.1",
  generatedAt: input.generatedAt,
  source: "exports/lahman-derived-season-scores.json",
  chartType: "race-timeline",
  metric: "composite",
  seasons,
  points,
  frames
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("Wrote " + path.relative(root, outputPath) + " with " + points.length + " points.");
