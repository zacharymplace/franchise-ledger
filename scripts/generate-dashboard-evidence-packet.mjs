import { readFile, writeFile } from "node:fs/promises";

const summary = JSON.parse(
  await readFile("exports/dashboard-summary.json", "utf8")
);

const snapshot = JSON.parse(
  await readFile("exports/race-horse-dashboard-snapshot.json", "utf8")
);

const lines = [];

lines.push("# Franchise Ledger Dashboard Evidence Packet");
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push(`- Dashboard status: ${summary.status || "Ready"}`);
lines.push(`- Snapshot standings: ${snapshot.finalStandings.length}`);
lines.push("");
lines.push("## Final Standings");
lines.push("");

for (const row of snapshot.finalStandings) {
  lines.push(
    `- #${row.rank} ${row.displayName} (${row.compositeScore})`
  );
}

lines.push("");
lines.push("## Evidence");
lines.push("");
lines.push("- Dashboard summary export present");
lines.push("- Race horse dashboard export present");
lines.push("- Dashboard snapshot export present");
lines.push("- Browser smoke validation required");
lines.push("- Snapshot drift guard required");

await writeFile(
  "reports/dashboard-evidence-packet.md",
  lines.join("\n") + "\n"
);

console.log(
  "Wrote reports/dashboard-evidence-packet.md"
);
