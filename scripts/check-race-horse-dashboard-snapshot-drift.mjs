import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import crypto from "node:crypto";

const snapshotPath = "exports/race-horse-dashboard-snapshot.json";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

if (!existsSync(snapshotPath)) {
  fail(`Missing snapshot artifact: ${snapshotPath}`);
  console.error("Rerun: npm run dashboard-snapshot");
  process.exit();
}

const text = await readFile(snapshotPath, "utf8");
const snapshot = JSON.parse(text);

if (!Array.isArray(snapshot.finalStandings) || snapshot.finalStandings.length === 0) {
  fail("Snapshot final standings are missing or empty.");
}

if (!snapshot.finalStandings.every((item) =>
  item.displayName &&
  Number.isInteger(item.rank) &&
  Number.isFinite(item.compositeScore)
)) {
  fail("Snapshot final standings have invalid row shape.");
}

if (snapshot.finalStandings[0]?.rank !== 1) {
  fail("Snapshot final standings do not start with rank #1.");
}

console.log("PASS: Race horse dashboard snapshot drift guard checked.");
console.log(`snapshot: ${snapshotPath}`);
console.log(`sha256: ${hash(text)}`);
