import fs from "node:fs";

const reportPath = "reports/scoring-comparison-report.md";
const text = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, "utf8") : "";

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!text) fail("Missing scoring comparison report.");
if (!text.includes("# Franchise Ledger Scoring Comparison Report")) fail("Missing report title.");
if (!text.includes("## Component Driver Snapshot")) fail("Missing component driver snapshot.");
if (!text.includes("## Season Leaders")) fail("Missing season leaders section.");
if (!text.includes("Regular Season")) fail("Missing regular season component.");
if (!text.includes("Era Adj.")) fail("Missing era adjustment component.");

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger scoring comparison report is valid.");
}
