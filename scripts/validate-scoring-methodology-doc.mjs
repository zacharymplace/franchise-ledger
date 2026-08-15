import fs from "node:fs";

const docPath = "docs/scoring-methodology.md";
const text = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "";

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!text) fail("Missing scoring methodology doc.");

const requiredSections = [
  "# Franchise Ledger Scoring Methodology",
  "## Purpose",
  "## Current Model",
  "## Component: Regular Season Strength",
  "## Component: Postseason Bonus",
  "## Component: Era Adjustment",
  "## Component: Consistency",
  "## Grades",
  "## Replay and Diff Process",
  "## Known Limitations",
  "## Model Philosophy"
];

for (const section of requiredSections) {
  if (!text.includes(section)) {
    fail("Missing methodology section: " + section);
  }
}

const requiredPhrases = [
  "config/scoring-model-v0.2.json",
  "npm run scoring-model-diff",
  "npm run verify-full-lahman",
  "model outputs rather than authoritative rankings",
  "Experimental",
  "strength of schedule",
  "run differential",
  "advanced baseball metrics"
];

for (const phrase of requiredPhrases) {
  if (!text.includes(phrase)) {
    fail("Missing methodology phrase: " + phrase);
  }
}


const readmePath = "README.md";
const readmeText = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";

const uniqueReadmeSections = [
  "## Full Local Confidence Gate",
  "## Manual Full-Check Workflow Dispatch"
];

for (const section of uniqueReadmeSections) {
  const matches = readmeText.match(new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || [];
  if (matches.length > 1) {
    fail("Duplicate README section: " + section);
  }
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger scoring methodology doc is valid.");
}
