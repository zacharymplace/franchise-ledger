import fs from "node:fs";

const path = "exports/dashboard-summary.json";
const summary = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : null;

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!summary) fail("Missing dashboard summary export.");
if (summary?.generatedAt !== "generated") fail("Expected deterministic generatedAt.");
if (summary?.dataset?.source !== "example-lahman") fail("Missing example Lahman dataset source.");
if (summary?.dataset?.scores !== 35) fail("Expected 35 example scores.");
if (summary?.dataset?.racePoints !== 35) fail("Expected 35 example race points.");
if (summary?.dataset?.seasons !== 7) fail("Expected 7 example seasons.");
if (summary?.dataset?.franchises !== 5) fail("Expected 5 example franchises.");
if (!summary?.reports?.scoringComparison) fail("Missing scoring comparison report status.");
if (!summary?.reports?.scoringModelDiff) fail("Missing scoring model diff report status.");
if (!summary?.leaderSnapshot?.name) fail("Missing leader snapshot name.");
if (!summary?.leaderSnapshot?.season) fail("Missing leader snapshot season.");

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger dashboard summary is valid.");
}
