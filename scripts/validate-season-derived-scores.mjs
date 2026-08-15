import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "exports/example-season-derived-scores.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

const data = JSON.parse(fs.readFileSync(outputPath, "utf8"));

if (data.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (!Array.isArray(data.scores) || data.scores.length === 0) {
  fail("scores must be a non-empty array.");
}

for (const row of data.scores || []) {
  for (const key of ["legacy", "current", "momentum", "composite"]) {
    const value = row.scores?.[key];

    if (typeof value !== "number" || value < 0 || value > 100) {
      fail(row.franchiseId + " has invalid " + key + " score.");
    }
  }

  if (!row.grade || typeof row.grade !== "string") {
    fail(row.franchiseId + " must include a grade.");
  }

  if (typeof row.components?.regularSeasonStrength !== "number") {
    fail(row.franchiseId + " missing regularSeasonStrength.");
  }

  if (typeof row.components?.postseasonBonus !== "number") {
    fail(row.franchiseId + " missing postseasonBonus.");
  }
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger season-derived scores are valid.");
}
