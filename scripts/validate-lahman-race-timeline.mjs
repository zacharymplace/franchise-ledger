import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const filePath = path.join(root, "exports/lahman-race-timeline.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

if (data.schemaVersion !== "0.1") fail("Expected schemaVersion 0.1.");
if (data.chartType !== "race-timeline") fail("Expected race-timeline chartType.");
if (data.metric !== "composite") fail("Expected composite metric.");

if (!Array.isArray(data.seasons) || data.seasons.length === 0) fail("seasons must be non-empty.");
if (!Array.isArray(data.points) || data.points.length === 0) fail("points must be non-empty.");
if (!Array.isArray(data.frames) || data.frames.length !== data.seasons.length) {
  fail("frames length must match seasons length.");
}

const seen = new Set();

for (const point of data.points || []) {
  const key = point.season + ":" + point.franchiseId;
  if (seen.has(key)) fail("Duplicate race point: " + key);
  seen.add(key);

  if (!data.seasons.includes(point.season)) fail("Point season missing from seasons list.");
  if (!point.franchiseId || !point.name) fail("Point missing franchise identity.");
  if (typeof point.score !== "number" || point.score < 0 || point.score > 100) {
    fail("Point score must be 0 to 100.");
  }
  if (!point.grade) fail("Point missing grade.");
}

for (const frame of data.frames || []) {
  if (!data.seasons.includes(frame.season)) fail("Frame season missing from seasons list.");
  if (!Array.isArray(frame.standings) || frame.standings.length === 0) {
    fail("Frame standings must be non-empty.");
  }

  const ranks = new Set();

  for (const standing of frame.standings || []) {
    if (!Number.isInteger(standing.rank) || standing.rank < 1) {
      fail("Standing rank must be a positive integer.");
    }
    if (ranks.has(standing.rank)) fail("Duplicate standing rank in " + frame.season + ".");
    ranks.add(standing.rank);
  }
}

if (!process.exitCode) {
  console.log("PASS: Lahman race timeline export is valid (" + data.points.length + " points).");
}
