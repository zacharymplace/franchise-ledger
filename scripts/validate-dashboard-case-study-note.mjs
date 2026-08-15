import { readFile } from "node:fs/promises";

const notePath = "case-studies/dashboard-evidence-note.md";
const text = await readFile(notePath, "utf8");

const required = [
  "# Franchise Ledger Dashboard Evidence Note",
  "## What this proves",
  "## Evidence packet",
  "## Operating-system pattern",
  "reports/dashboard-evidence-packet.md",
  "dashboard-evidence",
  "validate-dashboard-evidence",
  "dashboard-evidence-drift",
];

let ok = true;

for (const item of required) {
  if (!text.includes(item)) {
    console.error(`FAIL: Missing case-study note content: ${item}`);
    ok = false;
  }
}

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger dashboard case-study note is valid.");
