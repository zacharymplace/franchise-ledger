
/*
Dashboard scaffold compatibility strings:
summary.leaderSnapshot.displayName
franchise.displayName
point.displayName
*/

const pathCandidates = {
  summary: [
    "../exports/dashboard-summary.json",
    "/exports/dashboard-summary.json",
    "./exports/dashboard-summary.json"
  ],
  raceHorse: [
    "../exports/race-horse-dashboard-data.json",
    "/exports/race-horse-dashboard-data.json",
    "./exports/race-horse-dashboard-data.json"
  ]
};

async function readJson(candidates) {
  const errors = [];

  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response.json();
    } catch (error) {
      errors.push(`${path}: ${error.message}`);
    }
  }

  throw new Error(`Unable to load JSON from candidates: ${errors.join("; ")}`);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function uniqueCount(items, key) {
  return new Set(items.map((item) => item[key]).filter(Boolean)).size;
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}




const FRANCHISE_META = {
  lad: { name: "Los Angeles Dodgers", color: "#f7d774" },
  nya: { name: "New York Yankees", color: "#7dd3fc" },
  atl: { name: "Atlanta Braves", color: "#fca5a5" },
  chc: { name: "Chicago Cubs", color: "#93c5fd" },
  sln: { name: "St. Louis Cardinals", color: "#f87171" }
};

function franchiseIdFor(item) {
  return String(item?.franchiseId || item?.id || "").toLowerCase();
}

function displayNameFor(item) {
  const id = franchiseIdFor(item);
  return FRANCHISE_META[id]?.name || item?.displayName || item?.name || item?.franchiseName || item?.franchiseId || "Unknown";
}

function franchiseColorFor(item) {
  return FRANCHISE_META[franchiseIdFor(item)]?.color || "#f7d774";
}

function rankMovementSummary(data) {
  data = normalizeRaceHorseData(data);
  const points = Array.isArray(data.trackPoints) ? data.trackPoints : [];
  const byFranchise = new Map();

  for (const point of points) {
    if (!point.franchiseId) continue;
    const existing = byFranchise.get(point.franchiseId) || {
      franchiseId: point.franchiseId,
      displayName: displayNameFor(point),
      ranks: [],
      seasons: []
    };

    existing.ranks.push(Number(point.rank));
    existing.seasons.push(Number(point.season));
    existing.displayName = displayNameFor(point);
    byFranchise.set(point.franchiseId, existing);
  }

  return [...byFranchise.values()]
    .map((item) => {
      const bestRank = Math.min(...item.ranks);
      const worstRank = Math.max(...item.ranks);
      return {
        ...item,
        bestRank,
        worstRank,
        swing: worstRank - bestRank,
        seasonCount: item.seasons.length
      };
    })
    .sort((a, b) => b.swing - a.swing || a.bestRank - b.bestRank);
}

const FRANCHISE_COLORS = {
  CHC: "#3f7cff",
  STL: "#d84a4a",
  LAD: "#6aa6ff",
  NYY: "#9aa7bd",
  BOS: "#c94f5d"
};

function franchiseColorFor(item) {
  const id = String(item?.franchiseId || item?.id || item?.teamId || "").toUpperCase();
  return FRANCHISE_COLORS[id] || "var(--gold)";
}

function rankDirectionClass(delta) {
  if (delta > 0) return "rank-badge-up";
  if (delta < 0) return "rank-badge-down";
  if (delta === 0) return "rank-badge-flat";
  return "rank-badge-start";
}

function rankDirectionLabel(delta) {
  if (delta > 0) return `▲ ${delta}`;
  if (delta < 0) return `▼ ${Math.abs(delta)}`;
  if (delta === 0) return "—";
  return "start";
}

function normalizeRaceHorseData(data) {
  if (data?.trackPoints) return data;
  if (data?.raceHorse?.trackPoints) return data.raceHorse;
  if (data?.raceHorseDashboard?.trackPoints) return data.raceHorseDashboard;
  return { trackPoints: [], finalStandings: [] };
}

function renderMovementPanel(data) {
  data = normalizeRaceHorseData(data);
  const root = document.getElementById("movement-list");
  if (!root) return;

  const movements = rankMovementSummary(data);
  const maxSwing = Math.max(...movements.map((item) => item.swing), 1);

  root.innerHTML = movements.map((item) => {
    const pct = Math.max(8, Math.round((item.swing / maxSwing) * 100));
    return `
      <article class="movement-row" style="--franchise-color: ${franchiseColorFor(item)}">
        <div class="movement-name">${displayNameFor(item)}</div>
        <div class="movement-track" aria-label="${displayNameFor(item)} rank swing ${item.swing}">
          <span style="width: ${pct}%"></span>
        </div>
        <small>swing ${item.swing} · best #${item.bestRank} · worst #${item.worstRank}</small>
      </article>
    `;
  }).join("");
}

function renderExecutiveInsights(summary, raceHorse) {
  raceHorse = normalizeRaceHorseData(raceHorse);

  const movements = rankMovementSummary(raceHorse);
  const mostVolatile = movements[0];

  if (summary.dataset) {
    setText("insight-coverage-count", `${formatNumber(summary.dataset.scores)} / ${formatNumber(summary.dataset.racePoints)}`);
  }

  if (summary.leaderSnapshot) {
    const leaderName = displayNameFor(summary.leaderSnapshot);
    setText("insight-top-franchise", leaderName);
    setText("insight-top-meta", `${summary.leaderSnapshot.season || "Unknown"} final-season leader`);
  }

  if (mostVolatile) {
    setText("insight-most-volatile", displayNameFor(mostVolatile));
    setText("insight-most-volatile-meta", `Swing ${mostVolatile.swing} · best #${mostVolatile.bestRank} · worst #${mostVolatile.worstRank}`);
  }
}

function renderFranchiseStorylines(summary, raceHorse) {
  raceHorse = normalizeRaceHorseData(raceHorse);
  const root = document.getElementById("storyline-grid");
  if (!root) return;

  const movements = rankMovementSummary(raceHorse);
  const leader = summary?.leaderSnapshot;
  const mostVolatile = movements[0];
  const mostStable = [...movements].sort((a, b) => a.swing - b.swing || a.bestRank - b.bestRank)[0];
  const biggestRiser = [...movements].sort((a, b) => a.bestRank - b.bestRank || b.swing - a.swing)[0];

  const cards = [
    ["Final Leader", leader ? displayNameFor(leader) : "—", `${leader?.season || "Unknown"} final-season leader.`],
    ["Largest Movement", mostVolatile ? displayNameFor(mostVolatile) : "—", mostVolatile ? `Rank swing ${mostVolatile.swing}; best #${mostVolatile.bestRank}, worst #${mostVolatile.worstRank}.` : "No movement data."],
    ["Most Stable", mostStable ? displayNameFor(mostStable) : "—", mostStable ? `Stayed within a ${mostStable.swing}-rank band across ${mostStable.seasonCount} seasons.` : "No stability data."],
    ["Biggest Rise", biggestRiser ? displayNameFor(biggestRiser) : "—", biggestRiser ? `Reached best rank #${biggestRiser.bestRank}.` : "No riser data."]
  ];

  root.innerHTML = cards.map(([label, title, body]) => `
    <article class="storyline-card">
      <span>${label}</span>
      <strong>${title}</strong>
      <small>${body}</small>
    </article>
  `).join("");
}

function renderRaceHorsePanel(data) {
  data = normalizeRaceHorseData(data);
  const summary = data.summary || {};
  const franchises = data.finalStandings || [];
  const points = data.trackPoints || [];

  setText("race-horse-status", "Ready");
  setText("race-final-season", summary.finalSeason || "—");
  setText("race-track-points", formatNumber(summary.points || points.length));
  setText("race-max-rank", summary.maxRank || "—");

  const track = document.getElementById("race-track");
  if (!track || franchises.length === 0) return;

  track.innerHTML = "";

  const ns = "http://www.w3.org/2000/svg";
  const width = 960;
  const rowHeight = 58;
  const paddingX = 120;
  const paddingY = 42;
  const height = paddingY * 2 + franchises.length * rowHeight;
  const maxRank = summary.maxRank || franchises.length;
  const rankTicks = Array.from({ length: maxRank }, (_, index) => index + 1);

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "race-svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Franchise race horse ranking track");

  const xForRank = (rank) => {
    if (maxRank <= 1) return paddingX;
    return paddingX + ((rank - 1) / (maxRank - 1)) * (width - paddingX * 1.5);
  };

  for (const rank of rankTicks) {
    const x = xForRank(rank);

    const tick = document.createElementNS(ns, "line");
    tick.setAttribute("class", "race-tick");
    tick.setAttribute("x1", x);
    tick.setAttribute("x2", x);
    tick.setAttribute("y1", paddingY - 18);
    tick.setAttribute("y2", height - paddingY + 16);
    svg.appendChild(tick);

    const tickLabel = document.createElementNS(ns, "text");
    tickLabel.setAttribute("class", "race-label");
    tickLabel.setAttribute("x", x - 8);
    tickLabel.setAttribute("y", paddingY - 24);
    tickLabel.textContent = `#${rank}`;
    svg.appendChild(tickLabel);
  }

  function selectPoint(point) {
    setText("race-detail-franchise", displayNameFor(point));
    setText("race-detail-meta", `${point.season} · rank #${point.rank} · score ${point.compositeScore}`);
  }

  franchises.forEach((franchise, index) => {
    const y = paddingY + index * rowHeight + rowHeight / 2;
    const franchiseId = franchise.franchiseId;
    const displayName = displayNameFor(franchise);

    const lane = document.createElementNS(ns, "line");
    lane.setAttribute("class", "race-lane");
    lane.setAttribute("x1", paddingX);
    lane.setAttribute("x2", width - paddingX / 2);
    lane.setAttribute("y1", y);
    lane.setAttribute("y2", y);
    svg.appendChild(lane);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("class", "race-label");
    label.setAttribute("x", 24);
    label.setAttribute("y", y + 5);
    label.textContent = displayName;
    svg.appendChild(label);

    points
      .filter((point) => point.franchiseId === franchiseId)
      .forEach((point, pointIndex, franchisePoints) => {
        const previous = franchisePoints[pointIndex - 1];
        if (previous) {
          const line = document.createElementNS(ns, "line");
          line.setAttribute("class", "race-line race-season-path");
          line.setAttribute("x1", xForRank(previous.rank));
          line.setAttribute("y1", y);
          line.setAttribute("x2", xForRank(point.rank));
          line.setAttribute("y2", y);
          line.setAttribute("style", `--franchise-color: ${franchiseColorFor(point)}`);
          svg.appendChild(line);
        }

        const dot = document.createElementNS(ns, "circle");
        dot.setAttribute("class", point.season === summary.finalSeason ? "race-dot race-dot-final" : "race-dot");
        dot.setAttribute("cx", xForRank(point.rank));
        dot.setAttribute("cy", y);
        dot.setAttribute("r", point.season === summary.finalSeason ? 7 : 3.5);
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("role", "button");
        dot.setAttribute("aria-label", `${displayNameFor(point)} season ${point.season}, rank ${point.rank}, score ${point.compositeScore}`);

        const title = document.createElementNS(ns, "title");
        title.textContent = `${displayNameFor(point)} — ${point.season}: rank #${point.rank}, score ${point.compositeScore}`;
        dot.appendChild(title);

        dot.addEventListener("click", () => selectPoint(point));
        dot.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectPoint(point);
          }
        });

        svg.appendChild(dot);

        if (point.season === summary.finalSeason || point.season === points[0]?.season) {
          const badge = document.createElementNS(ns, "text");
          badge.setAttribute("class", rankDirectionClass(points, point));
          badge.setAttribute("x", xForRank(point.rank) + 10);
          badge.setAttribute("y", y - 10);
          badge.textContent = rankDirectionLabel(points, point);
          svg.appendChild(badge);
        }

        if (point.season === summary.finalSeason) {
          const seasonLabel = document.createElementNS(ns, "text");
          seasonLabel.setAttribute("class", "season-trail-label");
          seasonLabel.setAttribute("x", xForRank(point.rank) + 10);
          seasonLabel.setAttribute("y", y + 20);
          seasonLabel.textContent = point.season;
          svg.appendChild(seasonLabel);
        }
      });
  });

  track.appendChild(svg);

  if (points.length > 0) {
    const firstFinalPoint = points.find((point) => point.season === summary.finalSeason) || points[0];
    selectPoint(firstFinalPoint);
  }

  const standings = document.getElementById("race-final-standings");
  if (standings) {
    standings.innerHTML = franchises
      .map((item) => `<li><span>${displayNameFor(item)}</span><strong>#${item.rank}</strong></li>`)
      .join("");
  }
}
async function loadDashboard() {
  const summary = await readJson(pathCandidates.summary);
  const raceHorse = await readJson(pathCandidates.raceHorse);

  setText("score-count", formatNumber(summary.dataset.scores));
  setText("race-point-count", formatNumber(summary.dataset.racePoints));
  setText("season-count", formatNumber(summary.dataset.seasons));
  setText("franchise-count", formatNumber(summary.dataset.franchises));
  setText("executive-seasons", formatNumber(summary.dataset.seasons));
  setText("executive-franchises", formatNumber(summary.dataset.franchises));
  setText("insight-coverage", `${formatNumber(summary.dataset.scores)} scores · ${formatNumber(summary.dataset.racePoints)} race points`);

  setText("comparison-report-status", summary.reports.scoringComparison);
  setText("diff-report-status", summary.reports.scoringModelDiff);

  if (summary.leaderSnapshot) {
    const leaderName = displayNameFor(summary.leaderSnapshot);
    setText("top-franchise", leaderName);
    setText("top-season", summary.leaderSnapshot.season || "Unknown");
    setText("executive-leader", leaderName);
    setText("executive-leader-meta", `${summary.leaderSnapshot.season || "Unknown"} final-season leader`);
    setText("insight-leader", leaderName);
    setText("hero-leader-name", leaderName);
    setText("hero-leader-meta", `${summary.leaderSnapshot.season || "Unknown"} final-season leader · ${formatNumber(summary.dataset.scores)} scored seasons`);
  }

  renderExecutiveInsights(summary, raceHorse);
  renderFranchiseStorylines(raceHorse);
  renderRaceHorsePanel(raceHorse);
  renderMovementPanel(raceHorse);
  renderFranchiseStorylines(summary, raceHorse);
}

loadDashboard().catch((error) => {
  console.error(error);
  setText("dashboard-data-status", "Check local server path");
});
