import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exportPath = path.join(root, "exports/example-race-chart-data.json");

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

if (!fs.existsSync(exportPath)) {
  fail("Missing race chart export.");
}

const data = readJson(exportPath);

if (data.schemaVersion !== "0.1") {
  fail("Expected schemaVersion 0.1.");
}

if (data.chartType !== "race-timeline") {
  fail("Expected chartType race-timeline.");
}

if (!["legacy", "current", "momentum", "composite"].includes(data.metric)) {
  fail("Invalid metric: " + data.metric);
}

if (!Array.isArray(data.seasons) || data.seasons.length < 2) {
  fail("seasons must include at least two values.");
}

if (!Array.isArray(data.series) || data.series.length < 2) {
  fail("series must include at least two franchises.");
}

if (!Array.isArray(data.frames) || data.frames.length !== data.seasons.length) {
  fail("frames length must equal seasons length.");
}

for (const item of data.series || []) {
  if (!item.franchiseId || !item.name) {
    fail("Each series item must include franchiseId and name.");
  }

  if (!Array.isArray(item.points) || item.points.length !== data.seasons.length) {
    fail("Each series item must include one point per season.");
  }

  for (const point of item.points || []) {
    if (!data.seasons.includes(point.season)) {
      fail("Series point has season outside season list.");
    }

    if (typeof point.score !== "number" || point.score < 0 || point.score > 100) {
      fail("Series point score must be 0 to 100.");
    }
  }
}

for (const frame of data.frames || []) {
  if (!data.seasons.includes(frame.season)) {
    fail("Frame has season outside season list.");
  }

  if (!Array.isArray(frame.standings) || frame.standings.length !== data.series.length) {
    fail("Each frame must include one standing per franchise.");
  }

  const ranks = new Set();

  for (const standing of frame.standings || []) {
    if (!Number.isInteger(standing.rank) || standing.rank < 1) {
      fail("Each standing must include a positive integer rank.");
    }

    if (ranks.has(standing.rank)) {
      fail("Duplicate rank in frame " + frame.season + ": " + standing.rank);
    }

    ranks.add(standing.rank);

    if (!standing.franchiseId || !standing.name) {
      fail("Each standing must include franchiseId and name.");
    }

    if (typeof standing.score !== "number" || standing.score < 0 || standing.score > 100) {
      fail("Standing score must be 0 to 100.");
    }
  }
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger race chart export is valid.");
}
