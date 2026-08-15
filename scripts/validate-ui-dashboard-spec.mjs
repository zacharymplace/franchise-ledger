import fs from "node:fs";

const path = "ui-dashboard-spec.md";
const text = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!text) fail("Missing UI dashboard spec.");

const requiredSections = [
  "# Franchise Ledger UI Dashboard Spec",
  "## Header",
  "## Section 1: Scoring Model",
  "## Section 2: Replay / Diff Review",
  "## Section 3: Scoring Comparison",
  "## Section 4: Generated Artifacts",
  "## Section 5: Full Dataset Verification",
  "## Section 6: Governance",
  "## Review Workflow",
  "## Future Enhancements"
];

for (const section of requiredSections) {
  if (!text.includes(section)) {
    fail("Missing dashboard spec section: " + section);
  }
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger UI dashboard spec is valid.");
}
