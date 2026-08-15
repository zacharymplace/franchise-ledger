import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "exports/lahman-derived-season-scores.json");
const mapPath = path.join(root, "data/franchise-map.json");
const outputPath = path.join(root, "reports/lahman-derived-season-score-report.md");

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(inputPath)) {
  fail("Missing Lahman-derived season scores.");
}

if (!fs.existsSync(mapPath)) {
  fail("Missing franchise map.");
}

const input = readJson(inputPath);
const map = readJson(mapPath);
const franchiseNames = new Map((map.franchises || []).map((franchise) => [franchise.id, franchise.name]));

if (!Array.isArray(input.scores) || input.scores.length === 0) {
  fail("scores must be a non-empty array.");
}

const ranked = [...input.scores].sort((a, b) => {
  if (a.season !== b.season) return b.season - a.season;
  if (b.scores.composite !== a.scores.composite) return b.scores.composite - a.scores.composite;
  return a.franchiseId.localeCompare(b.franchiseId);
});

const seasons = [...new Set(ranked.map((row) => row.season))].sort((a, b) => a - b);
const averageComposite =
  ranked.reduce((sum, row) => sum + row.scores.composite, 0) / ranked.length;

const top = [...ranked].sort((a, b) => b.scores.composite - a.scores.composite)[0];
const bottom = [...ranked].sort((a, b) => a.scores.composite - b.scores.composite)[0];

const lines = [];

lines.push("# Franchise Ledger Lahman-Derived Season Score Report");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("- Schema version: " + input.schemaVersion);
lines.push("- Generated at: " + input.generatedAt);
lines.push("- Source: " + input.source);
lines.push("- Scoring model: " + input.scoringModel);
lines.push("- Dataset type: processed Lahman adapter output");
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push("- Seasons covered: " + seasons.join(", "));
lines.push("- Scores generated: " + ranked.length);
lines.push("- Average composite score: " + averageComposite.toFixed(1));
lines.push("- Top score: " + franchiseNames.get(top.franchiseId) + " " + top.season + " (" + top.scores.composite + ")");
lines.push("- Lowest score: " + franchiseNames.get(bottom.franchiseId) + " " + bottom.season + " (" + bottom.scores.composite + ")");
lines.push("");
lines.push("## Ranked Scores");
lines.push("");
lines.push("| Season | Rank | Franchise | Grade | Composite | Legacy | Current | Momentum | W-L |");
lines.push("|---:|---:|---|---:|---:|---:|---:|---:|---:|");

for (const season of [...seasons].sort((a, b) => b - a)) {
  const rows = ranked
    .filter((row) => row.season === season)
    .sort((a, b) => b.scores.composite - a.scores.composite);

  rows.forEach((row, index) => {
    lines.push(
      "| " +
        row.season +
        " | " +
        (index + 1) +
        " | " +
        franchiseNames.get(row.franchiseId) +
        " | " +
        row.grade +
        " | " +
        row.scores.composite +
        " | " +
        row.scores.legacy +
        " | " +
        row.scores.current +
        " | " +
        row.scores.momentum +
        " | " +
        row.sourceInputs.wins +
        "-" +
        row.sourceInputs.losses +
        " |"
    );
  });
}

lines.push("");
lines.push("## Component Notes");
lines.push("");

for (const row of ranked) {
  lines.push("### " + franchiseNames.get(row.franchiseId) + " " + row.season);
  lines.push("");
  lines.push("- Regular-season strength: " + row.components.regularSeasonStrength);
  lines.push("- Postseason bonus: " + row.components.postseasonBonus);
  lines.push("- Era adjustment: " + row.components.eraAdjustment);
  lines.push("- Consistency: " + row.components.consistency);
  lines.push("- Season win-pct baseline: " + row.components.seasonWinPctBaseline);
  lines.push("- Postseason reached: " + row.sourceInputs.postseasonReached);
  lines.push("- Pennant: " + row.sourceInputs.pennant);
  lines.push("- Championship: " + row.sourceInputs.championship);
  lines.push("");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
lines.push("## Data Caveat");
lines.push("");
lines.push("This report is generated from the committed illustrative Lahman-shaped example dataset. It validates the Franchise Ledger pipeline but is not authoritative historical analysis.");
lines.push("");
fs.writeFileSync(outputPath, lines.join("\n") + "\n");

console.log("Wrote " + path.relative(root, outputPath));
