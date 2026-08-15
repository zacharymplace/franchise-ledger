import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "examples/example-season-records.json");
const mapPath = path.join(root, "data/franchise-map.json");
const outputPath = path.join(root, "exports/example-season-derived-scores.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function gradeFromScore(score) {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

function scoreRecord(record) {
  const games = record.wins + record.losses;
  if (games <= 0) fail("Record has no games: " + record.franchiseId);

  const computedWinPct = Number((record.wins / games).toFixed(3));

  if (Math.abs(computedWinPct - record.winPct) > 0.002) {
    fail(
      "winPct mismatch for " +
        record.franchiseId +
        ": expected approximately " +
        computedWinPct +
        ", found " +
        record.winPct
    );
  }

  const regularSeasonStrength = clamp(Math.round(record.winPct * 100), 0, 100);
  const postseasonBonus =
    (record.postseasonReached ? 8 : 0) +
    (record.pennant ? 7 : 0) +
    (record.championship ? 10 : 0);

  const current = clamp(regularSeasonStrength + postseasonBonus, 0, 100);
  const momentum = clamp(regularSeasonStrength + (record.postseasonReached ? 5 : -5), 0, 100);
  const legacy = clamp(Math.round(current * 0.7 + momentum * 0.3), 0, 100);
  const composite = clamp(Math.round(legacy * 0.35 + current * 0.45 + momentum * 0.2), 0, 100);

  return {
    schemaVersion: "0.1",
    franchiseId: record.franchiseId,
    season: record.season,
    inputs: {
      wins: record.wins,
      losses: record.losses,
      winPct: record.winPct,
      postseasonReached: record.postseasonReached,
      pennant: record.pennant,
      championship: record.championship
    },
    components: {
      regularSeasonStrength,
      postseasonBonus
    },
    scores: {
      legacy,
      current,
      momentum,
      composite
    },
    grade: gradeFromScore(composite)
  };
}

const input = readJson(inputPath);
const map = readJson(mapPath);
const franchiseIds = new Set((map.franchises || []).map((franchise) => franchise.id));

if (!Array.isArray(input.records) || input.records.length === 0) {
  fail("records must be a non-empty array.");
}

const scored = input.records.map((record) => {
  if (!franchiseIds.has(record.franchiseId)) {
    fail("Unknown franchiseId: " + record.franchiseId);
  }

  return scoreRecord(record);
});

const output = {
  schemaVersion: "0.1",
  generatedAt: input.generatedAt ?? "2026-06-18T00:00:00.000Z",
  source: "examples/example-season-records.json",
  description: "Derived example scores from normalized season records.",
  scores: scored
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("Wrote " + path.relative(root, outputPath));
