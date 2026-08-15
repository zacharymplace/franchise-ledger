import { execFileSync } from "node:child_process";

try {
  execFileSync("npm", ["run", "dashboard-visual-snapshot"], {
    stdio: "inherit"
  });

  execFileSync("git", [
    "diff",
    "--exit-code",
    "--",
    "reports/visual-snapshots/dashboard-visual-snapshot.svg",
    "reports/visual-snapshots/dashboard-visual-snapshot.json"
  ], { stdio: "inherit" });

  console.log("PASS: Franchise Ledger dashboard visual snapshot drift guard checked.");
} catch {
  console.error("FAIL: Franchise Ledger dashboard visual snapshot drifted.");
  process.exit(1);
}
