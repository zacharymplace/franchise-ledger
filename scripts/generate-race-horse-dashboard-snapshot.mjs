import { readFile, writeFile } from "node:fs/promises";

const sourcePath = "exports/race-horse-dashboard-data.json";
const outputPath = "exports/race-horse-dashboard-snapshot.json";

const data = JSON.parse(await readFile(sourcePath, "utf8"));

const snapshot = {
  generatedAt: "generated",
  source: sourcePath,
  leader: data.finalStandings?.[0]?.displayName || null,
  leaderFranchiseId: data.finalStandings?.[0]?.franchiseId || null,
  finalSeason: data.summary?.finalSeason,
  franchiseCount: data.summary?.franchises,
  pointCount: data.summary?.points,
  maxRank: data.summary?.maxRank,
  finalStandings: (data.finalStandings || []).map((item) => ({
    rank: item.rank,
    franchiseId: item.franchiseId,
    displayName: item.displayName,
    compositeScore: item.compositeScore,
  })),
};

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
