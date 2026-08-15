import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "examples/example-race-timeline.json");
const mapPath = path.join(root, "data/franchise-map.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(inputPath)) {
  fail("Missing example race timeline input.");
}

if (!fs.existsSync(mapPath)) {
  fail("Missing franchise map.");
}

const input = readJson(inputPath);
const map = readJson(mapPath);
const franchiseIds = new Set((map.franchises || []).map((franchise) => franchise.id));

const requiredTopLevel = [
  "schemaVersion",
  "generatedAt",
  "description",
  "metric",
  "points"
];

for (const key of requiredTopLevel) {
  if (!(key in input)) {
    fail("Missing top-level field: " + key);
  }
}

if (input.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (Number.isNaN(Date.parse(input.generatedAt))) {
  fail("generatedAt must be an ISO-compatible timestamp.");
}

if (typeof input.description !== "string" || input.description.trim().length < 20) {
  fail("description must be a descriptive string.");
}

const validMetrics = new Set(["legacy", "current", "momentum", "composite"]);

if (!validMetrics.has(input.metric)) {
  fail("metric must be legacy, current, momentum, or composite.");
}

if (!Array.isArray(input.points) || input.points.length === 0) {
  fail("points must be a non-empty array.");
}

const seenPointKeys = new Set();
const seasons = new Set();
const timelineFranchises = new Set();

for (const point of input.points || []) {
  if (!Number.isInteger(point.season) || point.season < 1871) {
    fail("Each point.season must be an integer >= 1871.");
  }

  if (!franchiseIds.has(point.franchiseId)) {
    fail("Unknown franchiseId: " + point.franchiseId);
  }

  if (typeof point.score !== "number" || point.score < 0 || point.score > 100) {
    fail("Each point.score must be a number from 0 to 100.");
  }

  const key = point.season + ":" + point.franchiseId;

  if (seenPointKeys.has(key)) {
    fail("Duplicate race point: " + key);
  }

  seenPointKeys.add(key);
  seasons.add(point.season);
  timelineFranchises.add(point.franchiseId);
}

if (seasons.size < 2) {
  fail("Race timeline must include at least two seasons.");
}

if (timelineFranchises.size < 2) {
  fail("Race timeline must include at least two franchises.");
}

const seasonList = [...seasons].sort((a, b) => a - b);
const franchiseList = [...timelineFranchises].sort();

for (let index = 1; index < seasonList.length; index += 1) {
  if (seasonList[index] <= seasonList[index - 1]) {
    fail("Seasons must sort in increasing order.");
  }
}

for (const franchiseId of franchiseList) {
  for (const season of seasonList) {
    const key = season + ":" + franchiseId;

    if (!seenPointKeys.has(key)) {
      fail("Missing race point for " + franchiseId + " in " + season + ".");
    }
  }
}

const expectedPointCount = seasonList.length * franchiseList.length;

if (input.points.length !== expectedPointCount) {
  fail(
    "Expected " +
      expectedPointCount +
      " points from " +
      seasonList.length +
      " seasons and " +
      franchiseList.length +
      " franchises, found " +
      input.points.length +
      "."
  );
}

if (!process.exitCode) {
  console.log(
    "PASS: Franchise Ledger race timeline example is valid with " +
      seasonList.length +
      " seasons, " +
      franchiseList.length +
      " franchises, and " +
      input.points.length +
      " points."
  );
}
