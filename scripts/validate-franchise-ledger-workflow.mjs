import fs from "node:fs";


function assertContains(text, snippet, message) {
  if (!text.includes(snippet)) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

const workflowPath = ".github/workflows/franchise-ledger.yml";
const text = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, "utf8") : "";

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (!text) fail("Missing Franchise Ledger workflow.");

const requiredSnippets = [
  "name: Franchise Ledger",
  "workflow_dispatch:",
  "pull_request:",
  "push:",
  "branches:",
  "- main",
  "**",
  "package.json",
  ".github/workflows/franchise-ledger.yml",
  "jobs:",
  "check:",
  "full-check:",
  "if: github.event_name == 'workflow_dispatch'",
  "uses: actions/checkout@v4",
  "uses: actions/setup-node@v4",
  'node-version: "20"',
  "run: npm ci",
  "Run Franchise Ledger docs check",
  "run: npm run docs-check",
  "Run Franchise Ledger check",
  "run: npm run check",
  "run: sudo apt-get update && sudo apt-get install -y p7zip-full",
  "run: npm run download-lahman",
  "run: npm run full-check"
];

for (const snippet of requiredSnippets) {
  if (!text.includes(snippet)) {
    fail("Missing workflow snippet: " + snippet);
  }
}

const fullCheckIndex = text.indexOf("full-check:");
const dispatchGuardIndex = text.indexOf("if: github.event_name == 'workflow_dispatch'", fullCheckIndex);

if (fullCheckIndex === -1 || dispatchGuardIndex === -1) {
  fail("Full check job must be gated to workflow_dispatch.");
}

const readmePath = "README.md";
const readmeText = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";

const requiredReadmeSnippets = [
  "## Manual Full-Check Workflow Dispatch",
  "GitHub → Actions → Franchise Ledger → Run workflow",
  "npm run full-check",
  "full Lahman dataset",
  "does not slow normal PR checks"
];

for (const snippet of requiredReadmeSnippets) {
  if (!readmeText.includes(snippet)) {
    fail("Missing README dispatch documentation snippet: " + snippet);
  }
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger workflow shape is valid.");
}

assertContains(readmeText, "race-horse-dashboard-snapshot.json", "README documents race-horse-dashboard-snapshot.json");

assertContains(readmeText, "dashboard-snapshot", "README documents dashboard-snapshot");

assertContains(readmeText, "validate-dashboard-snapshot", "README documents validate-dashboard-snapshot");

assertContains(readmeText, "dashboard-snapshot-drift", "README documents dashboard-snapshot-drift");
assertContains(readmeText, "dashboard-evidence-packet.md", "README documents dashboard evidence packet artifact");
assertContains(readmeText, "dashboard-evidence", "README documents dashboard evidence generator");
assertContains(readmeText, "validate-dashboard-evidence", "README documents dashboard evidence validator");
assertContains(readmeText, "dashboard-evidence-drift", "README documents dashboard evidence drift guard");
