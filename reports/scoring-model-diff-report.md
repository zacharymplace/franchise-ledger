# Franchise Ledger Scoring Model Diff Report

## Source

- Baseline config: config/scoring-model-baseline-v0.2.json
- Active config: config/scoring-model-v0.2.json
- Active score export: exports/lahman-derived-season-scores.json
- Compared scores: 35
- Changed scores: 0

## Largest Composite Moves

| Season | Franchise | Baseline | Active | Delta | Grade Change |
|---:|---|---:|---:|---:|---|
| 2025 | atl | 41 | 41 | 0 | F → F |
| 2025 | chc | 40 | 40 | 0 | F → F |
| 2025 | lad | 55 | 55 | 0 | F → F |
| 2025 | nyy | 43 | 43 | 0 | F → F |
| 2025 | stl | 35 | 35 | 0 | F → F |
| 2000 | atl | 44 | 44 | 0 | F → F |
| 2000 | chc | 29 | 29 | 0 | F → F |
| 2000 | lad | 39 | 39 | 0 | F → F |
| 2000 | nyy | 49 | 49 | 0 | F → F |
| 2000 | stl | 44 | 44 | 0 | F → F |
| 1980 | atl | 37 | 37 | 0 | F → F |
| 1980 | chc | 30 | 30 | 0 | F → F |
| 1980 | lad | 42 | 42 | 0 | F → F |
| 1980 | nyy | 48 | 48 | 0 | F → F |
| 1980 | stl | 34 | 34 | 0 | F → F |
| 1960 | atl | 42 | 42 | 0 | F → F |
| 1960 | chc | 29 | 29 | 0 | F → F |
| 1960 | lad | 39 | 39 | 0 | F → F |
| 1960 | nyy | 52 | 52 | 0 | F → F |
| 1960 | stl | 41 | 41 | 0 | F → F |

## Review Notes

- This report compares the active generated score output against a committed baseline config replay.
- A zero-delta report means the active config currently matches the baseline config.
- Future scoring config changes should update the active config first, then review this diff before promoting the baseline.

