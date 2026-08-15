import { readFileSync } from "node:fs";

const svgPath = "reports/visual-snapshots/dashboard-visual-snapshot.svg";
const svg = readFileSync(svgPath, "utf8");

const textContent = [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/gis)]
  .map((match) => match[1].replace(/<[^>]+>/g, "").trim())
  .filter(Boolean)
  .join("\n");

let ok = true;

function requirePattern(label, pattern) {
  if (!pattern.test(svg) && !pattern.test(textContent)) {
    console.error(`FAIL: Missing visual snapshot content: ${label}`);
    ok = false;
  }
}

function forbidPattern(label, pattern) {
  if (pattern.test(textContent)) {
    console.error(`FAIL: Forbidden visual snapshot content: ${label}`);
    ok = false;
  }
}

requirePattern("SVG root", /<svg\b/i);
requirePattern("dashboard title", /Franchise Ledger/i);
requirePattern("race view content", /rank|season|final|leader|standing/i);
requirePattern("season or rank marker", /#\d|rank|season/i);
requirePattern("full franchise names", /Chicago|Boston|New York|Los Angeles|St\. Louis/i);

forbidPattern("lad abbreviation text node", /^lad$/im);

if (!ok) {
  console.error("\nVisible text content:");
  console.error(textContent);
  process.exit(1);
}

console.log("PASS: Franchise Ledger dashboard visual snapshot content is valid.");
