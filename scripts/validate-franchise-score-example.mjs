import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const examplePath = path.join(root, "examples/example-franchise-score.json");
const mapPath = path.join(root, "data/franchise-map.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(examplePath)) {
  fail("Missing example franchise score.");
}

if (!fs.existsSync(mapPath)) {
  fail("Missing franchise map.");
}

const example = readJson(examplePath);
const map = readJson(mapPath);
const franchiseIds = new Set((map.franchises || []).map((franchise) => franchise.id));

const requiredTopLevel = [
  "schemaVersion",
  "generatedAt",
  "franchiseId",
  "season",
  "scores",
  "grade",
  "drivers",
  "movement",
  "confidence",
  "analystOverlay"
];

for (const key of requiredTopLevel) {
  if (!(key in example)) {
    fail("Missing top-level field: " + key);
  }
}

if (example.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (Number.isNaN(Date.parse(example.generatedAt))) {
  fail("generatedAt must be an ISO-compatible timestamp.");
}

if (!franchiseIds.has(example.franchiseId)) {
  fail("Unknown franchiseId: " + example.franchiseId);
}

if (!Number.isInteger(example.season) || example.season < 1871) {
  fail("season must be an integer >= 1871.");
}

const scoreKeys = ["legacy", "current", "momentum", "composite"];

for (const key of scoreKeys) {
  const value = example.scores?.[key];

  if (typeof value !== "number" || value < 0 || value > 100) {
    fail("scores." + key + " must be a number from 0 to 100.");
  }
}

const validGrades = new Set([
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F"
]);

if (!validGrades.has(example.grade)) {
  fail("Invalid grade: " + example.grade);
}

for (const bucket of ["positive", "negative"]) {
  const values = example.drivers?.[bucket];

  if (!Array.isArray(values) || values.length === 0) {
    fail("drivers." + bucket + " must be a non-empty array.");
  }

  for (const value of values || []) {
    if (typeof value !== "string" || value.trim().length < 8) {
      fail("drivers." + bucket + " entries must be descriptive strings.");
    }
  }
}

if (typeof example.movement?.previousComposite !== "number") {
  fail("movement.previousComposite must be numeric.");
}

if (typeof example.movement?.delta !== "number") {
  fail("movement.delta must be numeric.");
}

const validDirections = new Set(["up", "down", "flat"]);

if (!validDirections.has(example.movement?.direction)) {
  fail("movement.direction must be up, down, or flat.");
}

const expectedDelta = example.scores.composite - example.movement.previousComposite;

if (example.movement.delta !== expectedDelta) {
  fail("movement.delta must equal composite minus previousComposite.");
}

const validConfidence = new Set(["low", "medium", "high"]);

if (!validConfidence.has(example.confidence)) {
  fail("confidence must be low, medium, or high.");
}

const adjustment = example.analystOverlay?.adjustment;

if (typeof adjustment !== "number" || adjustment < -5 || adjustment > 5) {
  fail("analystOverlay.adjustment must be between -5 and 5.");
}

if (
  typeof example.analystOverlay?.reason !== "string" ||
  example.analystOverlay.reason.trim().length < 20
) {
  fail("analystOverlay.reason must be a descriptive string.");
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger example score schema is valid.");
}
