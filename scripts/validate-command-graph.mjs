import { readFile } from "node:fs/promises";

const fixtureMode = process.argv.includes("--fixture-negative");

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const scripts = pkg.scripts || {};

if (fixtureMode) {
  scripts["docs-check"] = "npm run check";
}

let ok = true;

function fail(message) {
  console.error(`FAIL: ${message}`);
  ok = false;
}

function requireScript(name) {
  if (!scripts[name]) fail(`Missing script: ${name}`);
}

function requireIncludes(name, expected) {
  requireScript(name);
  if (scripts[name] && !scripts[name].includes(expected)) {
    fail(`${name} must include ${expected}`);
  }
}

function commandTokens(script) {
  return script
    .split("&&")
    .map((part) => part.trim())
    .filter(Boolean);
}

function forbidSelfReference(name) {
  const selfCommand = `npm run ${name}`;
  if (commandTokens(scripts[name] || "").includes(selfCommand)) {
    fail(`${name} references itself`);
  }
}

for (const name of [
  "docs-check",
  "check",
  "export",
  "validate",
  "drift",
  "dashboard-snapshot-drift",
  "validate-package-script-wiring",
]) {
  requireScript(name);
  forbidSelfReference(name);
}

requireIncludes("docs-check", "validate-workflow");
requireIncludes("docs-check", "dashboard-smoke");
requireIncludes("docs-check", "validate-package-script-wiring");
requireIncludes("docs-check", "validate-dashboard-render-content-negative");

requireIncludes("check", "adapt");
requireIncludes("check", "report");
requireIncludes("check", "export");
requireIncludes("check", "validate");
requireIncludes("check", "drift");
requireIncludes("check", "dashboard-snapshot-drift");

requireIncludes("export", "dashboard-snapshot");
requireIncludes("validate", "validate-dashboard-snapshot");

if (scripts["docs-check"]?.includes("check")) {
  fail("docs-check must not call full check");
}

if (scripts["drift"]?.includes("dashboard-snapshot-drift")) {
  fail("drift must stay generic; snapshot drift guard belongs in check");
}

if (fixtureMode) {
  if (!ok) {
    console.log("PASS: Franchise Ledger command graph negative fixture failed as expected.");
    process.exit(0);
  }
  console.error("FAIL: Negative fixture unexpectedly passed.");
  process.exit(1);
}

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger command graph is valid.");
