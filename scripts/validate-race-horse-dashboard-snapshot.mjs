import { readFile } from "node:fs/promises";

const path = "exports/race-horse-dashboard-snapshot.json";
const snapshot = JSON.parse(await readFile(path, "utf8"));

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

if (snapshot.generatedAt !== "generated") fail("generatedAt must be stable.");
if (snapshot.source !== "exports/race-horse-dashboard-data.json") fail("source mismatch.");
if (!snapshot.leader) fail("leader is required.");
if (!snapshot.leaderFranchiseId) fail("leaderFranchiseId is required.");
if (!Number.isInteger(snapshot.finalSeason)) fail("finalSeason must be an integer.");
if (!Number.isInteger(snapshot.franchiseCount) || snapshot.franchiseCount < 1) fail("franchiseCount must be positive.");
if (!Number.isInteger(snapshot.pointCount) || snapshot.pointCount < snapshot.franchiseCount) fail("pointCount must cover franchises.");
if (!Number.isInteger(snapshot.maxRank) || snapshot.maxRank < 1) fail("maxRank must be positive.");
if (!Array.isArray(snapshot.finalStandings)) fail("finalStandings must be an array.");
if (snapshot.finalStandings.length !== snapshot.franchiseCount) fail("finalStandings length must match franchiseCount.");

const ranks = new Set();

for (const item of snapshot.finalStandings || []) {
  if (!Number.isInteger(item.rank)) fail("standing rank must be an integer.");
  if (!item.franchiseId) fail("standing franchiseId is required.");
  if (!item.displayName) fail("standing displayName is required.");
  if (!Number.isFinite(item.compositeScore)) fail("standing compositeScore must be numeric.");
  if (ranks.has(item.rank)) fail(`duplicate rank: ${item.rank}`);
  ranks.add(item.rank);
}

if (!ranks.has(1)) fail("rank 1 must be present.");

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger race horse dashboard snapshot is valid.");
}
