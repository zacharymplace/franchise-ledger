import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";

const root = process.cwd();

const baselineConfigPath = path.join(root, "config/scoring-model-baseline-v0.2.json");
const activeConfigPath = path.join(root, "config/scoring-model-v0.2.json");
const activeScoresPath = process.env.FRANCHISE_LEDGER_ACTIVE_SCORES || path.join(root, "exports/lahman-derived-season-scores.json");
const tempConfigPath = path.join(root, "config/.tmp-scoring-model-replay.json");
const tempScoresPath = process.env.FRANCHISE_LEDGER_REPLAY_TEMP || path.join(os.tmpdir(), "franchise-ledger-replay-lahman-derived-season-scores.json");
const outputPath = process.env.FRANCHISE_LEDGER_DIFF_REPORT || path.join(root, "reports/scoring-model-diff-report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function scoreKey(row) {
  return row.franchiseId + ":" + row.season;
}

function runScorerWithConfig(configPath, outputPathOverride) {
  const originalConfig = fs.readFileSync(activeConfigPath, "utf8");

  try {
    fs.copyFileSync(configPath, activeConfigPath);
    execFileSync("node", ["scripts/score-lahman-season-records.mjs"], {
      stdio: "inherit",
      env: {
        ...process.env,
        ...process.env,
        FRANCHISE_LEDGER_SCORE_OUTPUT: outputPathOverride,
        FRANCHISE_LEDGER_SCORE_INPUT:
          process.env.FRANCHISE_LEDGER_SCORE_INPUT || "data/processed/lahman-season-records.json"
      }
    });
  } finally {
    fs.writeFileSync(activeConfigPath, originalConfig);
  }
}

if (!fs.existsSync(baselineConfigPath)) {
  console.error("FAIL: Missing baseline scoring config.");
  process.exit(1);
}

if (!fs.existsSync(activeScoresPath)) {
  console.error("FAIL: Missing active Lahman score export.");
  process.exit(1);
}

const activeScores = readJson(activeScoresPath);

runScorerWithConfig(baselineConfigPath, tempScoresPath);

const baselineScores = readJson(tempScoresPath);
const baselineByKey = new Map((baselineScores.scores || []).map((row) => [scoreKey(row), row]));

const deltas = [];

for (const active of activeScores.scores || []) {
  const baseline = baselineByKey.get(scoreKey(active));

  if (!baseline) continue;

  deltas.push({
    franchiseId: active.franchiseId,
    name: active.name || active.franchiseId,
    season: active.season,
    baselineComposite: baseline.scores.composite,
    activeComposite: active.scores.composite,
    delta: active.scores.composite - baseline.scores.composite,
    baselineGrade: baseline.grade,
    activeGrade: active.grade
  });
}

deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.season - a.season || String(a.name).localeCompare(String(b.name)));

const changed = deltas.filter((row) => row.delta !== 0);

const lines = [];

lines.push("# Franchise Ledger Scoring Model Diff Report");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("- Baseline config: config/scoring-model-baseline-v0.2.json");
lines.push("- Active config: config/scoring-model-v0.2.json");
lines.push("- Active score export: exports/lahman-derived-season-scores.json");
lines.push("- Compared scores: " + deltas.length);
lines.push("- Changed scores: " + changed.length);
lines.push("");
lines.push("## Largest Composite Moves");
lines.push("");
lines.push("| Season | Franchise | Baseline | Active | Delta | Grade Change |");
lines.push("|---:|---|---:|---:|---:|---|");

for (const row of deltas.slice(0, 20)) {
  lines.push(
    "| " +
      row.season +
      " | " +
      row.name +
      " | " +
      row.baselineComposite +
      " | " +
      row.activeComposite +
      " | " +
      (row.delta > 0 ? "+" + row.delta : String(row.delta)) +
      " | " +
      row.baselineGrade +
      " → " +
      row.activeGrade +
      " |"
  );
}

lines.push("");
lines.push("## Review Notes");
lines.push("");
lines.push("- This report compares the active generated score output against a committed baseline config replay.");
lines.push("- A zero-delta report means the active config currently matches the baseline config.");
lines.push("- Future scoring config changes should update the active config first, then review this diff before promoting the baseline.");
lines.push("");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n") + "\n");

if (fs.existsSync(tempScoresPath)) fs.rmSync(tempScoresPath);
if (fs.existsSync(tempConfigPath)) fs.rmSync(tempConfigPath);

console.log("Wrote " + path.relative(root, outputPath));
