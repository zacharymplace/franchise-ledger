import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

const requiredFiles = [
  "README.md",
  "docs/methodology-v0.1.md",
  "data/franchise-map.json"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    fail("Missing required file: " + file);
  }
}

const map = readJson("data/franchise-map.json");

if (map.scope !== "MLB current organizations") {
  fail("Unexpected franchise map scope.");
}

if (!Array.isArray(map.franchises)) {
  fail("franchises must be an array.");
} else if (map.franchises.length !== 30) {
  fail("Expected 30 franchises, found " + map.franchises.length + ".");
}

const ids = new Set();

for (const franchise of map.franchises || []) {
  if (!franchise.id || !franchise.name) {
    fail("Each franchise must include id and name.");
  }

  if (ids.has(franchise.id)) {
    fail("Duplicate franchise id: " + franchise.id);
  }

  ids.add(franchise.id);
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger methodology spine is valid.");
}
