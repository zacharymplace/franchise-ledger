import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const filePath = path.join(root, "exports/lahman-derived-season-scores.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

if (data.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (data.scoringModel !== "season-records-v0.2") {
  fail("Unexpected scoring model: " + data.scoringModel);
}

if (data.scoringConfig !== "config/scoring-model-v0.2.json") {
  fail("Unexpected scoring config: " + data.scoringConfig);
}

if (!Array.isArray(data.scores) || data.scores.length === 0) {
  fail("scores must be a non-empty array.");
}

const seen = new Set();

for (const row of data.scores || []) {
  if (!row.franchiseId) {
    fail("score row missing franchiseId.");
  }

  if (!Number.isInteger(row.season) || row.season < 1871) {
    fail("score row has invalid season.");
  }

  const key = row.franchiseId + ":" + row.season;

  if (seen.has(key)) {
    fail("duplicate derived score: " + key);
  }

  seen.add(key);

  for (const scoreKey of ["legacy", "current", "momentum", "composite"]) {
    const value = row.scores?.[scoreKey];

    if (typeof value !== "number" || value < 0 || value > 100) {
      fail(key + " has invalid " + scoreKey + " score.");
    }
  }

  if (!row.grade || typeof row.grade !== "string") {
    fail(key + " must include grade.");
  }

  if (typeof row.components?.regularSeasonStrength !== "number") {
    fail(key + " missing regularSeasonStrength.");
  }

  if (typeof row.components?.postseasonBonus !== "number") {
    fail(key + " missing postseasonBonus.");
  }

  if (typeof row.components?.eraAdjustment !== "number") {
    fail(key + " missing eraAdjustment.");
  }

  if (typeof row.components?.consistency !== "number") {
    fail(key + " missing consistency.");
  }

  if (typeof row.components?.seasonWinPctBaseline !== "number") {
    fail(key + " missing seasonWinPctBaseline.");
  }
}

if (!process.exitCode) {
  console.log("PASS: Lahman-derived season scores are valid (" + data.scores.length + " scores).");
}
