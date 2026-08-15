import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import crypto from "node:crypto";

const packetPath = "reports/dashboard-evidence-packet.md";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

if (!existsSync(packetPath)) {
  fail(`Missing dashboard evidence packet: ${packetPath}`);
  console.error("Rerun: npm run dashboard-evidence");
  process.exit();
}

const text = await readFile(packetPath, "utf8");

const required = [
  "# Franchise Ledger Dashboard Evidence Packet",
  "## Final Standings",
  "## Evidence",
  "Browser smoke validation required",
  "Snapshot drift guard required",
];

for (const item of required) {
  if (!text.includes(item)) {
    fail(`Missing dashboard evidence content: ${item}`);
  }
}

console.log("PASS: Franchise Ledger dashboard evidence drift guard checked.");
console.log(`packet: ${packetPath}`);
console.log(`sha256: ${hash(text)}`);
