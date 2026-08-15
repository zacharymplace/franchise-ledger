import { readFileSync } from "node:fs";

let html = readFileSync("dashboard/index.html", "utf8");
const app = readFileSync("dashboard/app.js", "utf8");
const css = readFileSync("dashboard/styles.css", "utf8");

let ok = true;

if (process.argv.includes("--fixture-negative")) {
  html = html.replaceAll("How to read this dashboard", "");
  html = html.replaceAll("Leader", "");
  html = html.replaceAll("Track points", "");
  html = html.replaceAll("Storylines", "");
}

const bodyText = typeof html === "string" ? html : "";

function requireSnippet(label, text, snippet) {
  if (!text.includes(snippet)) {
    console.error(`FAIL: Missing ${label}: ${snippet}`);
    ok = false;
  }
}

function forbidPattern(label, text, pattern) {
  if (pattern.test(text)) {
    console.error(`FAIL: Forbidden ${label}: ${pattern}`);
    ok = false;
  }
}

requireSnippet("full franchise name support", app, "displayNameFor");
requireSnippet("movement renderer", app, "renderMovementPanel(raceHorse)");
requireSnippet("storyline renderer", app, "renderFranchiseStorylines(summary, raceHorse)");
requireSnippet("season path JS", app, "race-season-path");
requireSnippet("season path CSS", css, ".race-season-path");
requireSnippet("franchise color JS", app, "franchiseColorFor");
requireSnippet("franchise color CSS", css, "--franchise-color");

forbidPattern("dashboard abbreviation fallback in HTML", html, />\s*lad\s*</i);
forbidPattern("dashboard abbreviation fallback in JS strings", app, /["'`]lad["'`]/i);


for (const text of [
  "How to read this dashboard",
  "Leader",
  "Track points",
  "Storylines"
]) {
  if (!bodyText.includes(text)) {
    console.error(`FAIL: Dashboard render missing reading guide text: ${text}`);
    ok = false;
  }
}

if (process.argv.includes("--fixture-negative")) {
  if (!ok) {
    console.log("PASS: Franchise Ledger dashboard render negative fixture failed as expected.");
    process.exit(0);
  }
  console.error("FAIL: Dashboard render negative fixture unexpectedly passed.");
  process.exit(1);
}

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger dashboard visual content regression is valid.");
