import { readFileSync } from "node:fs";

const html = readFileSync("dashboard/index.html", "utf8");
const css = readFileSync("dashboard/styles.css", "utf8");
const js = readFileSync("dashboard/app.js", "utf8");

const required = [
  [html, "franchise-storylines"],
  [html, "storyline-grid"],
  [html, "storyline-card"],
  [html, "storyline-leader"],
  [html, "storyline-riser"],
  [html, "storyline-volatility"],
  [css, ".franchise-storylines"],
  [css, ".storyline-grid"],
  [css, ".storyline-card"],
  [js, "function renderFranchiseStorylines"],
  [js, "renderFranchiseStorylines(raceHorse);"],
];

let ok = true;

for (const [text, snippet] of required) {
  if (!text.includes(snippet)) {
    console.error(`FAIL: Missing dashboard storyline contract: ${snippet}`);
    ok = false;
  }
}

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger dashboard storyline panel contract is valid.");
