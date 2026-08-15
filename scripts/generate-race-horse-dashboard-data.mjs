import fs from "node:fs";

const inputPath = "exports/lahman-race-timeline.json";
const outputPath = "exports/race-horse-dashboard-data.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function normalizePoint(point) {
  const season = Number(point.season);
  const franchiseId = String(point.franchiseId || point.teamId || point.id || "unknown");
  const displayName = String(point.franchiseName || point.name || point.teamName || franchiseId);
  const compositeScore = Number(point.compositeScore ?? point.score ?? point.totalScore ?? 0);
  const rank = Number(point.rank ?? 0);

  return {
    season,
    franchiseId,
    displayName,
    compositeScore,
    rank
  };
}

const raw = readJson(inputPath);
const rawPoints = Array.isArray(raw.points) ? raw.points : raw;

if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
  throw new Error("No race timeline points found.");
}

const points = rawPoints
  .map(normalizePoint)
  .filter((point) => Number.isFinite(point.season) && point.franchiseId !== "unknown")
  .sort((a, b) => a.season - b.season || a.rank - b.rank || b.compositeScore - a.compositeScore);

const seasons = [...new Set(points.map((point) => point.season))].sort((a, b) => a - b);
const franchiseIds = [...new Set(points.map((point) => point.franchiseId))].sort();

const seasonRankMap = new Map();

for (const season of seasons) {
  const seasonPoints = points
    .filter((point) => point.season === season)
    .sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      return b.compositeScore - a.compositeScore;
    });

  seasonPoints.forEach((point, index) => {
    const resolvedRank = point.rank || index + 1;
    seasonRankMap.set(`${season}:${point.franchiseId}`, resolvedRank);
    point.rank = resolvedRank;
  });
}

const maxRank = Math.max(...points.map((point) => point.rank));
const trackPoints = points.map((point) => {
  const position = maxRank - point.rank + 1;
  return {
    season: point.season,
    franchiseId: point.franchiseId,
    displayName: point.displayName,
    rank: point.rank,
    compositeScore: Number(point.compositeScore.toFixed(3)),
    position,
    label: `${point.displayName} • ${point.season} • rank ${point.rank}`
  };
});

const finalSeason = seasons.at(-1);
const finalStandings = trackPoints
  .filter((point) => point.season === finalSeason)
  .sort((a, b) => a.rank - b.rank)
  .map((point) => ({
    franchiseId: point.franchiseId,
    displayName: point.displayName,
    rank: point.rank,
    compositeScore: point.compositeScore,
    position: point.position
  }));

const summary = {
  generatedAt: "generated",
  source: inputPath,
  seasons: seasons.length,
  franchises: franchiseIds.length,
  points: trackPoints.length,
  firstSeason: seasons[0],
  finalSeason,
  maxRank
};

const output = {
  summary,
  finalStandings,
  trackPoints
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
console.log("Wrote " + outputPath);
