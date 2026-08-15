import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, process.env.FRANCHISE_LEDGER_SCORE_INPUT || "data/processed/lahman-season-records.json");
const outputPath = process.env.FRANCHISE_LEDGER_SCORE_OUTPUT || path.join(root, "exports/lahman-derived-season-scores.json");
const configPath = path.join(root, "config/scoring-model-v0.2.json");

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

function gradeFromScore(score, gradeScale) {
  const sortedScale = [...gradeScale].sort((a, b) => b.min - a.min);

  for (const row of sortedScale) {
    if (score >= row.min) return row.grade;
  }

  return "F";
}

function scoreRecord(record, config, seasonBaselines) {
  const bonuses = config.postseasonBonuses;
  const regularSeasonStrength = clamp(Math.round(record.winPct * 100), 0, 100);
  const postseasonBonus =
    (record.postseasonReached ? bonuses.postseasonReached : 0) +
    (record.pennant ? bonuses.pennant : 0) +
    (record.championship ? bonuses.championship : 0);

  const current = clamp(regularSeasonStrength + postseasonBonus, 0, 100);
  const momentum = clamp(regularSeasonStrength + (record.postseasonReached ? 5 : -5), 0, 100);
  const legacy = clamp(Math.round(current * 0.7 + momentum * 0.3), 0, 100);

  const seasonBaseline = seasonBaselines.get(record.season) ?? 0.5;
  const eraAdjustment = clamp(
    Math.round(50 + ((record.winPct - seasonBaseline) * 100)),
    0,
    100
  );
  const consistency = clamp(Math.round((legacy + current + momentum) / 3), 0, 100);

  const weights = config.components;

  const composite = clamp(
    Math.round(
      regularSeasonStrength * weights.regularSeasonStrength.weight +
      postseasonBonus * weights.postseasonBonus.weight +
      eraAdjustment * weights.eraAdjustment.weight +
      consistency * weights.consistency.weight
    ),
    0,
    100
  );

  return {
    franchiseId: record.franchiseId,
    season: record.season,
    sourceInputs: {
      wins: record.wins,
      losses: record.losses,
      winPct: record.winPct,
      postseasonReached: record.postseasonReached,
      pennant: record.pennant,
      championship: record.championship
    },
    components: {
      regularSeasonStrength,
      postseasonBonus,
      eraAdjustment,
      consistency,
      seasonWinPctBaseline: Number(seasonBaseline.toFixed(3))
    },
    scores: {
      legacy,
      current,
      momentum,
      composite
    },
    grade: gradeFromScore(composite, scoringConfig.gradeScale)
  };
}

if (!fs.existsSync(inputPath)) {
  fail("Missing processed Lahman season records.");
}

if (!fs.existsSync(configPath)) {
  fail("Missing scoring model config.");
}

const input = readJson(inputPath);
const scoringConfig = readJson(configPath);

if (input.schemaVersion !== "0.1") {
  fail("Expected input schemaVersion 0.1.");
}

if (!Array.isArray(input.records) || input.records.length === 0) {
  fail("Input records must be non-empty.");
}

const recordsBySeason = new Map();

for (const record of input.records) {
  if (!recordsBySeason.has(record.season)) {
    recordsBySeason.set(record.season, []);
  }

  recordsBySeason.get(record.season).push(record);
}

const seasonBaselines = new Map();

for (const [season, records] of recordsBySeason.entries()) {
  const totalWinPct = records.reduce((sum, record) => sum + record.winPct, 0);
  seasonBaselines.set(season, totalWinPct / records.length);
}

const scores = input.records.map((record) => scoreRecord(record, scoringConfig, seasonBaselines)).sort((a, b) => {
  if (a.season !== b.season) return a.season - b.season;
  if (b.scores.composite !== a.scores.composite) {
    return b.scores.composite - a.scores.composite;
  }
  return a.franchiseId.localeCompare(b.franchiseId);
});

const output = {
  schemaVersion: "0.1",
  generatedAt: input.generatedAt,
  source: "data/processed/lahman-season-records.json",
  scoringModel: scoringConfig.modelId,
      scoringConfig: "config/scoring-model-v0.2.json",
  description: "Derived Franchise Ledger scores from processed Lahman season records.",
  scores
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("Wrote " + path.relative(root, outputPath) + " with " + scores.length + " scores.");
