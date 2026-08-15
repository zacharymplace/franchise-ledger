import { existsSync, readFileSync } from "node:fs";

const svgPath = "reports/visual-snapshots/dashboard-visual-snapshot.svg";
const manifestPath = "reports/visual-snapshots/dashboard-visual-snapshot.json";

let ok = true;

if (!existsSync(svgPath)) {
  console.error(`FAIL: Missing dashboard visual snapshot: ${svgPath}`);
  ok = false;
}

if (!existsSync(manifestPath)) {
  console.error(`FAIL: Missing dashboard visual snapshot manifest: ${manifestPath}`);
  ok = false;
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const key of ["artifact", "format", "sha256", "bytes", "purpose"]) {
    if (!manifest[key]) {
      console.error(`FAIL: Missing dashboard visual snapshot manifest key: ${key}`);
      ok = false;
    }
  }
}

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger dashboard visual snapshot artifact is valid.");
