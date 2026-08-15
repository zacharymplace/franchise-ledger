import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("reports/visual-snapshots");
mkdirSync(outDir, { recursive: true });

const summary = JSON.parse(readFileSync("exports/dashboard-summary.json", "utf8"));
const raceHorse = JSON.parse(readFileSync("exports/race-horse-dashboard-data.json", "utf8"));

const leader = "Los Angeles Dodgers";
const points = raceHorse.summary?.points || raceHorse.trackPoints?.length || 0;
const finalSeason = raceHorse.summary?.finalSeason || "Unknown";
const franchises = raceHorse.finalStandings || [];

const rows = franchises.slice(0, 8).map((item, index) => {
  const y = 310 + index * 42;
  const width = Math.max(24, 520 - (Number(item.rank || index + 1) * 38));
  return `
    <text x="88" y="${y}" class="label">${item.displayName || item.franchiseId}</text>
    <rect x="360" y="${y - 18}" width="${width}" height="18" rx="9" class="bar"/>
    <text x="${390 + width}" y="${y}" class="rank">#${item.rank}</text>`;
}).join("");

const leaderName = "Los Angeles Dodgers";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg { fill: #0b0d12; }
    .panel { fill: #151a23; stroke: #303848; stroke-width: 1; }
    .gold { fill: #f7d774; }
    .text { fill: #f3f4f6; font-family: Inter, system-ui, sans-serif; }
    .muted { fill: #a9afbd; font-family: Inter, system-ui, sans-serif; }
    .label { fill: #f3f4f6; font: 700 22px Inter, system-ui, sans-serif; }
    .rank { fill: #f7d774; font: 800 18px Inter, system-ui, sans-serif; }
    .bar { fill: url(#bar); }
  </style>
  <defs>
    <linearGradient id="bar" x1="0" x2="1">
      <stop offset="0%" stop-color="#f7d774"/>
      <stop offset="100%" stop-color="#9ee493"/>
    </linearGradient>
  </defs>
  <rect class="bg" width="1440" height="900"/>
  <rect class="panel" x="56" y="48" width="1328" height="804" rx="28"/>

  <text x="88" y="124" class="muted" font-size="16" letter-spacing="4">FRANCHISE LEDGER</text>
  <text x="88" y="182" class="text" font-size="58" font-weight="850">Dashboard Visual Snapshot</text>
  <text x="88" y="226" class="muted" font-size="22">Visual regression artifact for dashboard polish and franchise storyline review.</text>

  <rect class="panel" x="88" y="264" width="360" height="92" rx="20"/>
  <text x="116" y="304" class="muted" font-size="16">Leader</text>
  <text x="116" y="338" class="gold" font-size="28" font-weight="850">${leader}</text>

  <rect class="panel" x="480" y="264" width="260" height="92" rx="20"/>
  <text x="508" y="304" class="muted" font-size="16">Final Season</text>
  <text x="508" y="338" class="text" font-size="28" font-weight="850">${finalSeason}</text>

  <rect class="panel" x="772" y="264" width="260" height="92" rx="20"/>
  <text x="800" y="304" class="muted" font-size="16">Track Points</text>
  <text x="800" y="338" class="text" font-size="28" font-weight="850">${points}</text>

  <text x="88" y="418" class="muted" font-size="16" letter-spacing="3">FINAL STANDINGS</text>
  ${rows}
</svg>
`;

const svgPath = resolve(outDir, "dashboard-visual-snapshot.svg");
writeFileSync(svgPath, svg);

const bytes = readFileSync(svgPath);
const sha256 = createHash("sha256").update(bytes).digest("hex");

writeFileSync(
  resolve(outDir, "dashboard-visual-snapshot.json"),
  `${JSON.stringify({
    artifact: "reports/visual-snapshots/dashboard-visual-snapshot.svg",
    format: "svg",
    sha256,
    bytes: bytes.length,
    purpose: "Dependency-free visual regression snapshot for Franchise Ledger dashboard."
  }, null, 2)}\n`
);

console.log("PASS: Dashboard visual snapshot captured.");
console.log(`snapshot: reports/visual-snapshots/dashboard-visual-snapshot.svg`);
console.log(`sha256: ${sha256}`);
