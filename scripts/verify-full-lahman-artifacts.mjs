import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";

const root = process.cwd();

const files = {
  records: "data/processed/full/lahman-season-records.json",
  scores: "exports/full/lahman-derived-season-scores.json",
  race: "exports/full/lahman-race-timeline.json",
  scoreReport: "reports/full/lahman-derived-season-score-report.md",
  raceReport: "reports/full/lahman-race-timeline-report.md"
};

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const [label, relativePath] of Object.entries(files)) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail("Missing full Lahman artifact: " + label + " at " + relativePath);
  }
}

if (!process.exitCode) {
  const records = readJson(files.records);
  const scores = readJson(files.scores);
  const race = readJson(files.race);

  if (!Array.isArray(records.records) || records.records.length < 1000) {
    fail("Expected at least 1000 full Lahman records.");
  }

  if (!Array.isArray(scores.scores) || scores.scores.length !== records.records.length) {
    fail("Full Lahman score count must equal record count.");
  }

  if (!Array.isArray(race.points) || race.points.length !== scores.scores.length) {
    fail("Full Lahman race point count must equal score count.");
  }

  const seasons = new Set(records.records.map((record) => record.season));
  const franchises = new Set(records.records.map((record) => record.franchiseId));

  console.log("PASS: full Lahman artifacts verified.");
  console.log("- Records: " + records.records.length);
  console.log("- Scores: " + scores.scores.length);
  console.log("- Race points: " + race.points.length);
  console.log("- Seasons: " + seasons.size);
  console.log("- Franchises: " + franchises.size);

  const replayReportPath = path.join(os.tmpdir(), "franchise-ledger-full-scoring-model-diff-report.md");
  const replayTempPath = path.join(os.tmpdir(), "franchise-ledger-full-replay-lahman-derived-season-scores.json");

  execFileSync("node", ["scripts/replay-scoring-model-diff.mjs"], {
    stdio: "inherit",
    env: {
      ...process.env,
      FRANCHISE_LEDGER_SCORE_INPUT: files.records,
      FRANCHISE_LEDGER_ACTIVE_SCORES: path.join(root, files.scores),
      FRANCHISE_LEDGER_DIFF_REPORT: replayReportPath,
      FRANCHISE_LEDGER_REPLAY_TEMP: replayTempPath
    }
  });

  if (!fs.existsSync(replayReportPath)) {
    fail("Full Lahman replay diff report was not generated.");
  }

  const replayText = fs.readFileSync(replayReportPath, "utf8");

  if (!replayText.includes("Compared scores: " + scores.scores.length)) {
    fail("Full Lahman replay diff did not compare the full score count.");
  }

  if (fs.existsSync(replayReportPath)) fs.rmSync(replayReportPath);
  if (fs.existsSync(replayTempPath)) fs.rmSync(replayTempPath);

  if (!process.exitCode) {
    console.log("PASS: full Lahman replay diff verified.");
  }
}
