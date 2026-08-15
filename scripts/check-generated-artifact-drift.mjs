import { execSync } from "node:child_process";

const paths = [
  "data/processed",
  "exports",
  "reports"
];

const output = execSync(
  "git status --short -- " + paths.map((path) => JSON.stringify(path)).join(" "),
  { encoding: "utf8" }
).trim();

if (output) {
  console.error("FAIL: Franchise Ledger generated artifacts drifted.");
  console.error(output);
  process.exit(1);
}

console.log("PASS: Franchise Ledger generated artifacts are stable.");
