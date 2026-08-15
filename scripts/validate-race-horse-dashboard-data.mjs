import fs from "node:fs";

const path = "exports/race-horse-dashboard-data.json";
const data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : null;

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!data) fail("Missing race horse dashboard data.");
if (data?.summary?.generatedAt !== "generated") fail("Expected deterministic generatedAt.");
if (data?.summary?.source !== "exports/lahman-race-timeline.json") fail("Unexpected source.");
if (data?.summary?.seasons !== 7) fail("Expected 7 example seasons.");
if (data?.summary?.franchises !== 5) fail("Expected 5 example franchises.");
if (data?.summary?.points !== 35) fail("Expected 35 race horse points.");
if (!Array.isArray(data?.finalStandings) || data.finalStandings.length !== 5) fail("Expected 5 final standings.");
if (!Array.isArray(data?.trackPoints) || data.trackPoints.length !== 35) fail("Expected 35 track points.");

const requiredPointFields = [
  "season",
  "franchiseId",
  "displayName",
  "rank",
  "compositeScore",
  "position",
  "label"
];

for (const point of data?.trackPoints || []) {
  for (const field of requiredPointFields) {
    if (!(field in point)) {
      fail("Missing track point field: " + field);
    }
  }

  if (!Number.isFinite(point.season)) fail("Invalid point season.");
  if (!Number.isFinite(point.rank)) fail("Invalid point rank.");
  if (!Number.isFinite(point.position)) fail("Invalid point position.");
  if (!Number.isFinite(point.compositeScore)) fail("Invalid point compositeScore.");
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger race horse dashboard data is valid.");
}
