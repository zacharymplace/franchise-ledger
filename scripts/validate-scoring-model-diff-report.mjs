import fs from "node:fs";

const reportPath = "reports/scoring-model-diff-report.md";
const text = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, "utf8") : "";

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!text) fail("Missing scoring model diff report.");
if (!text.includes("# Franchise Ledger Scoring Model Diff Report")) fail("Missing report title.");
if (!text.includes("## Largest Composite Moves")) fail("Missing largest composite moves section.");
if (!text.includes("Baseline config")) fail("Missing baseline config reference.");
if (!text.includes("Active config")) fail("Missing active config reference.");
if (!text.includes("Grade Change")) fail("Missing grade change column.");

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger scoring model diff report is valid.");
}
