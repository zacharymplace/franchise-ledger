import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const scripts = pkg.scripts || {};

let ok = true;

function requireScriptIncludes(scriptName, requiredFragment) {
  const script = pkg.scripts?.[scriptName] || "";
  if (!script.includes(requiredFragment)) {
    console.error(`FAIL: ${scriptName} must include ${requiredFragment}`);
    ok = false;
  }
}


function fail(message) {
  console.error(`FAIL: ${message}`);
  ok = false;
}

function requireScript(name) {
  if (!scripts[name]) fail(`Missing package script: ${name}`);
}

function requireIncludes(scriptName, snippet) {
  const value = scripts[scriptName] || "";
  if (!value.includes(snippet)) {
    fail(`Script ${scriptName} missing: ${snippet}`);
  }
}

requireScript("dashboard-snapshot");
requireScript("validate-dashboard-snapshot");
requireScript("dashboard-snapshot-drift");

requireIncludes("docs-check", "dashboard-smoke");
requireIncludes("check", "dashboard-snapshot-drift");
requireIncludes("export", "dashboard-snapshot");
requireIncludes("validate", "validate-dashboard-snapshot");


requireScriptIncludes("docs-check", "dashboard-visual-snapshot-drift");
requireScriptIncludes("docs-check", "validate-dashboard-visual-snapshot-content");
requireScriptIncludes("docs-check", "validate-dashboard-polish-content");
requireScriptIncludes("docs-check", "validate-dashboard-render-content");
requireScriptIncludes("docs-check", "validate-dashboard-render-content-negative");
requireScriptIncludes("check", "dashboard-visual-snapshot-drift");

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger package script wiring is valid.");
requireScript("dashboard-evidence-drift");
requireScript("validate-dashboard-render-content-negative");
requireIncludes("check", "dashboard-evidence-drift");
