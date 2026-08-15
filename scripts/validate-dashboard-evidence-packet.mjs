import { readFile } from "node:fs/promises";

const text = await readFile(
  "reports/dashboard-evidence-packet.md",
  "utf8"
);

const required = [
  "# Franchise Ledger Dashboard Evidence Packet",
  "## Final Standings",
  "## Evidence"
];

let ok = true;

for (const item of required) {
  if (!text.includes(item)) {
    console.error(`FAIL: Missing ${item}`);
    ok = false;
  }
}

if (!ok) process.exit(1);

console.log(
  "PASS: Franchise Ledger dashboard evidence packet is valid."
);
