import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scoresPath = path.join(root, "exports/lahman-derived-season-scores.json");
const outputPath = path.join(root, "reports/scoring-comparison-report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(scoresPath)) {
  console.error("FAIL: Missing Lahman-derived scores export.");
  process.exit(1);
}

const data = readJson(scoresPath);
const scores = data.scores || [];

const ranked = [...scores].sort((a, b) => {
  if (b.season !== a.season) return b.season - a.season;
  return b.scores.composite - a.scores.composite;
});

const bySeason = new Map();

for (const row of scores) {
  if (!bySeason.has(row.season)) {
    bySeason.set(row.season, []);
  }

  bySeason.get(row.season).push(row);
}

const lines = [];

lines.push("# Franchise Ledger Scoring Comparison Report");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("- Source: exports/lahman-derived-season-scores.json");
lines.push("- Scoring model: " + data.scoringModel);
lines.push("- Scoring config: " + data.scoringConfig);
lines.push("- Scores compared: " + scores.length);
lines.push("");
lines.push("## Purpose");
lines.push("");
lines.push("This report makes scoring-model effects reviewable by showing component-level drivers for the current generated score output.");
lines.push("");
lines.push("## Component Driver Snapshot");
lines.push("");
lines.push("| Season | Franchise | Composite | Regular Season | Postseason | Era Adj. | Consistency | Baseline |");
lines.push("|---:|---|---:|---:|---:|---:|---:|---:|");

for (const row of ranked) {
  lines.push(
    "| " +
      row.season +
      " | " +
      row.name +
      " | " +
      row.scores.composite +
      " | " +
      row.components.regularSeasonStrength +
      " | " +
      row.components.postseasonBonus +
      " | " +
      row.components.eraAdjustment +
      " | " +
      row.components.consistency +
      " | " +
      row.components.seasonWinPctBaseline +
      " |"
  );
}

lines.push("");
lines.push("## Season Leaders");
lines.push("");
lines.push("| Season | Leader | Composite | Runner-up | Gap |");
lines.push("|---:|---|---:|---|---:|");

for (const [season, rows] of [...bySeason.entries()].sort((a, b) => a[0] - b[0])) {
  const seasonRows = [...rows].sort((a, b) => b.scores.composite - a.scores.composite);
  const leader = seasonRows[0];
  const runnerUp = seasonRows[1];
  const gap = runnerUp ? leader.scores.composite - runnerUp.scores.composite : leader.scores.composite;

  lines.push(
    "| " +
      season +
      " | " +
      leader.name +
      " | " +
      leader.scores.composite +
      " | " +
      (runnerUp ? runnerUp.name : "n/a") +
      " | " +
      gap +
      " |"
  );
}

lines.push("");
lines.push("## Review Notes");
lines.push("");
lines.push("- This is not yet a before/after diff across multiple committed models.");
lines.push("- It establishes the review surface needed to compare later model versions.");
lines.push("- Future versions should preserve prior model outputs or add a model replay command.");
lines.push("");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n") + "\n");

console.log("Wrote " + path.relative(root, outputPath));
