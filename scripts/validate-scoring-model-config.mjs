import fs from "node:fs";

const config = JSON.parse(
  fs.readFileSync("config/scoring-model-v0.2.json", "utf8")
);

function fail(message) {
  console.error("FAIL: " + message);
  process.exitCode = 1;
}

if (config.schemaVersion !== "0.2") fail("schemaVersion must be 0.2.");
if (!config.modelId) fail("modelId is required.");

const components = config.components || {};
const weightTotal = Object.values(components).reduce(
  (sum, component) => sum + component.weight,
  0
);

if (Math.abs(weightTotal - 1) > 0.0001) {
  fail("component weights must sum to 1.");
}

for (const [name, component] of Object.entries(components)) {
  if (typeof component.weight !== "number" || component.weight < 0) {
    fail(name + " must include non-negative numeric weight.");
  }
}

for (const key of ["postseasonReached", "pennant", "championship"]) {
  if (typeof config.postseasonBonuses?.[key] !== "number") {
    fail("Missing postseason bonus: " + key);
  }
}

if (!Array.isArray(config.gradeScale) || config.gradeScale.length === 0) {
  fail("gradeScale must be non-empty.");
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger scoring model config is valid.");
}
