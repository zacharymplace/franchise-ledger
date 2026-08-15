import { readFileSync } from "node:fs";

const html = readFileSync("dashboard/index.html", "utf8");
const css = readFileSync("dashboard/polish.css", "utf8");

let ok = true;

function requireText(label, haystack, needle) {
  if (!haystack.includes(needle)) {
    console.error(`FAIL: Missing ${label}: ${needle}`);
    ok = false;
  }
}

requireText("reading guide section", html, "dashboard-reading-guide");
requireText("reading guide title", html, "How to read this dashboard");
requireText("leader explanation", html, "Leader");
requireText("track points explanation", html, "Track points");
requireText("storylines explanation", html, "Storylines");
requireText("polish stylesheet", html, "./polish.css");

requireText("reading guide css", css, ".dashboard-reading-guide");
requireText("responsive reading guide css", css, "@media");

if (!ok) process.exit(1);

console.log("PASS: Franchise Ledger dashboard polish content is valid.");
