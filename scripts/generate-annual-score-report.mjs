import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "examples/example-annual-scores.json");
const mapPath = path.join(root, "data/franchise-map.json");
const outputPath = path.join(root, "reports/example-annual-score-report.md");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function gradeRank(grade) {
  const order = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
  const index = order.indexOf(grade);
  return index === -1 ? 999 : index;
}

if (!fs.existsSync(inputPath)) {
  fail("Missing example annual scores input.");
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

if (!Number.isInteger(input.season)) {
  fail("season must be an integer.");
}

if (!Array.isArray(input.scores) || input.scores.length === 0) {
  fail("scores must be a non-empty array.");
}

const seen = new Set();

for (const row of input.scores) {
  if (!franchiseNames.has(row.franchiseId)) {
    fail("Unknown franchiseId: " + row.franchiseId);
  }

  if (seen.has(row.franchiseId)) {
    fail("Duplicate franchiseId: " + row.franchiseId);
  }

  seen.add(row.franchiseId);

  for (const key of ["legacy", "current", "momentum", "composite"]) {
    if (typeof row[key] !== "number" || row[key] < 0 || row[key] > 100) {
      fail(row.franchiseId + " has invalid " + key + " score.");
    }
  }

  if (!row.grade || typeof row.grade !== "string" || gradeRank(row.grade) === 999) {
    fail(row.franchiseId + " has invalid grade.");
  }

  if (!Array.isArray(row.drivers?.positive) || row.drivers.positive.length === 0) {
    fail(row.franchiseId + " must include positive drivers.");
  }

  if (!Array.isArray(row.drivers?.negative) || row.drivers.negative.length === 0) {
    fail(row.franchiseId + " must include negative drivers.");
  }
}

const ranked = [...input.scores].sort((a, b) => {
  if (b.composite !== a.composite) return b.composite - a.composite;
  return gradeRank(a.grade) - gradeRank(b.grade);
});

const averageComposite =
  ranked.reduce((sum, row) => sum + row.composite, 0) / ranked.length;

const lines = [];

lines.push("# Franchise Ledger Example Annual Score Report");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("- Schema version: " + input.schemaVersion);
lines.push("- Season: " + input.season);
lines.push("- Generated at: " + input.generatedAt);
lines.push("- Dataset type: illustrative example data");
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push("- Franchises scored: " + ranked.length);
lines.push("- Average composite score: " + averageComposite.toFixed(1));
lines.push("- Top franchise: " + franchiseNames.get(ranked[0].franchiseId) + " (" + ranked[0].composite + ")");
lines.push("- Lowest franchise: " + franchiseNames.get(ranked[ranked.length - 1].franchiseId) + " (" + ranked[ranked.length - 1].composite + ")");
lines.push("");
lines.push("## Ranked Scores");
lines.push("");
lines.push("| Rank | Franchise | Grade | Composite | Legacy | Current | Momentum |");
lines.push("|---:|---|---:|---:|---:|---:|---:|");

ranked.forEach((row, index) => {
  lines.push(
    "| " +
      (index + 1) +
      " | " +
      franchiseNames.get(row.franchiseId) +
      " | " +
      row.grade +
      " | " +
      row.composite +
      " | " +
      row.legacy +
      " | " +
      row.current +
      " | " +
      row.momentum +
      " |"
  );
});

lines.push("");
lines.push("## Driver Notes");
lines.push("");

for (const row of ranked) {
  lines.push("### " + franchiseNames.get(row.franchiseId));
  lines.push("");
  lines.push("Positive drivers:");
  for (const driver of row.drivers.positive) {
    lines.push("- " + driver);
  }
  lines.push("");
  lines.push("Negative drivers:");
  for (const driver of row.drivers.negative) {
    lines.push("- " + driver);
  }
  lines.push("");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n") + "\n");

console.log("Wrote " + path.relative(root, outputPath));
