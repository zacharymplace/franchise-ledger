import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = process.argv[2] || "data/raw/lahman/Teams.csv";
const outputPath = "data/processed/lahman-season-records.json";

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function normalizeFranchiseId(row) {
  const franchId = row.franchID || row.franchId || row.franchiseId;
  const teamId = row.teamID || row.teamId;

  const map = new Map([
    ["ARI", "ari"],
    ["ATL", "atl"],
    ["BAL", "bal"],
    ["BOS", "bos"],
    ["CHC", "chc"],
    ["CHW", "chw"],
    ["CIN", "cin"],
    ["CLE", "cle"],
    ["COL", "col"],
    ["DET", "det"],
    ["HOU", "hou"],
    ["KCR", "kc"],
    ["ANA", "laa"],
    ["LAA", "laa"],
    ["LAD", "lad"],
    ["FLA", "mia"],
    ["MIA", "mia"],
    ["MIL", "mil"],
    ["MIN", "min"],
    ["NYM", "nym"],
    ["NYY", "nyy"],
    ["OAK", "ath"],
    ["PHA", "ath"],
    ["PHI", "phi"],
    ["PIT", "pit"],
    ["SDP", "sd"],
    ["SFG", "sf"],
    ["SEA", "sea"],
    ["STL", "stl"],
    ["TBD", "tb"],
    ["TBR", "tb"],
    ["TEX", "tex"],
    ["TOR", "tor"],
    ["MON", "wsh"],
    ["WSN", "wsh"]
  ]);

  return map.get(franchId) || map.get(teamId) || null;
}

function championshipFromRow(row) {
  const wsWin = row.WSWin || row.wsWin || "";
  return wsWin === "Y";
}

function pennantFromRow(row) {
  const lgWin = row.LgWin || row.lgWin || "";
  return lgWin === "Y";
}

function postseasonFromRow(row) {
  return pennantFromRow(row) || championshipFromRow(row);
}

const absoluteInputPath = path.join(root, inputPath);

if (!fs.existsSync(absoluteInputPath)) {
  fail(
    "Missing Lahman Teams.csv input at " +
      inputPath +
      ". Place Lahman Teams.csv there or pass a path as the first argument."
  );
}

const rows = parseCsv(fs.readFileSync(absoluteInputPath, "utf8"));
const records = [];

for (const row of rows) {
  const franchiseId = normalizeFranchiseId(row);

  if (!franchiseId) {
    continue;
  }

  const season = Number(row.yearID);
  const wins = Number(row.W);
  const losses = Number(row.L);

  if (!Number.isInteger(season) || !Number.isInteger(wins) || !Number.isInteger(losses)) {
    continue;
  }

  const games = wins + losses;
  const winPct = games > 0 ? Number((wins / games).toFixed(3)) : 0;

  records.push({
    franchiseId,
    season,
    wins,
    losses,
    winPct,
    postseasonReached: postseasonFromRow(row),
    pennant: pennantFromRow(row),
    championship: championshipFromRow(row)
  });
}

const output = {
  schemaVersion: "0.1",
  generatedAt: "2026-06-18T00:00:00.000Z",
  source: inputPath,
  adapter: "lahman-season-records-adapter",
  records
};

fs.mkdirSync(path.join(root, path.dirname(outputPath)), { recursive: true });
fs.writeFileSync(path.join(root, outputPath), JSON.stringify(output, null, 2) + "\n");

console.log("Wrote " + outputPath + " with " + records.length + " records.");
