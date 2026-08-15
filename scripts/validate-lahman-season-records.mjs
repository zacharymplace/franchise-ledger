import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const filePath = path.join(root, "data/processed/lahman-season-records.json");
const mapPath = path.join(root, "data/franchise-map.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

function readJson(targetPath) {
  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}

if (!fs.existsSync(filePath)) {
  fail("Missing processed Lahman season records.");
}

if (!fs.existsSync(mapPath)) {
  fail("Missing franchise map.");
}

const data = readJson(filePath);
const map = readJson(mapPath);
const franchiseIds = new Set((map.franchises || []).map((franchise) => franchise.id));

if (data.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (data.adapter !== "lahman-season-records-adapter") {
  fail("Unexpected adapter: " + data.adapter);
}

if (!Array.isArray(data.records) || data.records.length === 0) {
  fail("records must be a non-empty array.");
}

const seenKeys = new Set();

for (const record of data.records || []) {
  if (!franchiseIds.has(record.franchiseId)) {
    fail("Unknown franchiseId: " + record.franchiseId);
  }

  if (!Number.isInteger(record.season) || record.season < 1871) {
    fail("Invalid season for " + record.franchiseId + ".");
  }

  if (!Number.isInteger(record.wins) || record.wins < 0) {
    fail("Invalid wins for " + record.franchiseId + " " + record.season + ".");
  }

  if (!Number.isInteger(record.losses) || record.losses < 0) {
    fail("Invalid losses for " + record.franchiseId + " " + record.season + ".");
  }

  const games = record.wins + record.losses;
  const expectedWinPct = games > 0 ? Number((record.wins / games).toFixed(3)) : 0;

  if (Math.abs(record.winPct - expectedWinPct) > 0.002) {
    fail("winPct mismatch for " + record.franchiseId + " " + record.season + ".");
  }

  for (const key of ["postseasonReached", "pennant", "championship"]) {
    if (typeof record[key] !== "boolean") {
      fail(key + " must be boolean for " + record.franchiseId + " " + record.season + ".");
    }
  }

  if (record.championship && !record.pennant) {
    fail("championship implies pennant for " + record.franchiseId + " " + record.season + ".");
  }

  const rowKey = record.franchiseId + ":" + record.season;

  if (seenKeys.has(rowKey)) {
    fail("Duplicate Lahman season record: " + rowKey);
  }

  seenKeys.add(rowKey);
}

if (!process.exitCode) {
  console.log("PASS: processed Lahman season records are valid (" + data.records.length + " records).");
}
