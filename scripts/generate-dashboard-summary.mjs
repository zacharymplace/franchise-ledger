import fs from "node:fs";

const scoresPath = "exports/lahman-derived-season-scores.json";
const racePath = "exports/lahman-race-timeline.json";
const comparisonPath = "reports/scoring-comparison-report.md";
const diffPath = "reports/scoring-model-diff-report.md";
const outputPath = "exports/dashboard-summary.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function readText(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

const scoresData = readJson(scoresPath);
const raceData = readJson(racePath);
const scores = Array.isArray(scoresData.scores) ? scoresData.scores : scoresData;
const racePoints = Array.isArray(raceData.points) ? raceData.points : raceData;

const seasons = new Set(scores.map((score) => score.season).filter(Boolean));
const franchises = new Set(scores.map((score) => score.franchiseId).filter(Boolean));

const topScore = [...scores].sort(
  (a, b) => Number(b.compositeScore ?? b.composite ?? 0) - Number(a.compositeScore ?? a.composite ?? 0)
)[0];

const comparisonText = readText(comparisonPath);
const diffText = readText(diffPath);

const summary = {
  generatedAt: "generated",
  dataset: {
    source: "example-lahman",
    scores: scores.length,
    racePoints: racePoints.length,
    seasons: seasons.size,
    franchises: franchises.size
  },
  reports: {
    scoringComparison: comparisonText.includes("# Franchise Ledger Scoring Comparison Report") ? "present" : "review",
    scoringModelDiff: diffText.includes("# Franchise Ledger Scoring Model Diff Report") ? "present" : "review"
  },
  leaderSnapshot: topScore
    ? {
        franchiseId: topScore.franchiseId ?? null,
        name: topScore.name || topScore.franchiseName || topScore.franchiseId || "Unknown",
        season: topScore.season ?? null,
        compositeScore: topScore.compositeScore ?? topScore.composite ?? null,
        grade: topScore.grade ?? null
      }
    : null
};

fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2) + "\n");
console.log("Wrote " + outputPath);
