# Franchise Ledger Scoring Comparison Report

## Source

- Source: exports/lahman-derived-season-scores.json
- Scoring model: season-records-v0.2
- Scoring config: config/scoring-model-v0.2.json
- Scores compared: 35

## Purpose

This report makes scoring-model effects reviewable by showing component-level drivers for the current generated score output.

## Component Driver Snapshot

| Season | Franchise | Composite | Regular Season | Postseason | Era Adj. | Consistency | Baseline |
|---:|---|---:|---:|---:|---:|---:|---:|
| 2025 | undefined | 55 | 63 | 25 | 57 | 79 | 0.558 |
| 2025 | undefined | 43 | 58 | 0 | 52 | 56 | 0.558 |
| 2025 | undefined | 41 | 56 | 0 | 50 | 54 | 0.558 |
| 2025 | undefined | 40 | 54 | 0 | 49 | 52 | 0.558 |
| 2025 | undefined | 35 | 48 | 0 | 42 | 46 | 0.558 |
| 2000 | undefined | 49 | 54 | 25 | 51 | 70 | 0.529 |
| 2000 | undefined | 44 | 59 | 0 | 56 | 57 | 0.529 |
| 2000 | undefined | 44 | 59 | 0 | 56 | 57 | 0.529 |
| 2000 | undefined | 39 | 53 | 0 | 50 | 51 | 0.529 |
| 2000 | undefined | 29 | 40 | 0 | 37 | 38 | 0.529 |
| 1980 | undefined | 48 | 64 | 0 | 63 | 62 | 0.511 |
| 1980 | undefined | 42 | 56 | 0 | 55 | 54 | 0.511 |
| 1980 | undefined | 37 | 50 | 0 | 49 | 48 | 0.511 |
| 1980 | undefined | 34 | 46 | 0 | 45 | 44 | 0.511 |
| 1980 | undefined | 30 | 40 | 0 | 38 | 38 | 0.511 |
| 1960 | undefined | 52 | 63 | 15 | 59 | 74 | 0.536 |
| 1960 | undefined | 42 | 57 | 0 | 53 | 55 | 0.536 |
| 1960 | undefined | 41 | 56 | 0 | 52 | 54 | 0.536 |
| 1960 | undefined | 39 | 53 | 0 | 50 | 51 | 0.536 |
| 1960 | undefined | 29 | 39 | 0 | 35 | 37 | 0.536 |
| 1940 | undefined | 42 | 57 | 0 | 55 | 55 | 0.522 |
| 1940 | undefined | 42 | 57 | 0 | 55 | 55 | 0.522 |
| 1940 | undefined | 41 | 55 | 0 | 53 | 53 | 0.522 |
| 1940 | undefined | 36 | 49 | 0 | 47 | 47 | 0.522 |
| 1940 | undefined | 32 | 43 | 0 | 41 | 41 | 0.522 |
| 1920 | undefined | 50 | 60 | 15 | 58 | 71 | 0.521 |
| 1920 | undefined | 46 | 62 | 0 | 60 | 60 | 0.521 |
| 1920 | undefined | 36 | 49 | 0 | 47 | 47 | 0.521 |
| 1920 | undefined | 36 | 49 | 0 | 47 | 47 | 0.521 |
| 1920 | undefined | 30 | 41 | 0 | 39 | 39 | 0.521 |
| 1900 | undefined | 51 | 60 | 15 | 70 | 71 | 0.402 |
| 1900 | undefined | 37 | 48 | 0 | 58 | 46 | 0.402 |
| 1900 | undefined | 35 | 46 | 0 | 56 | 44 | 0.402 |
| 1900 | undefined | 35 | 46 | 0 | 56 | 44 | 0.402 |
| 1900 | undefined | 1 | 0 | 0 | 10 | 0 | 0.402 |

## Season Leaders

| Season | Leader | Composite | Runner-up | Gap |
|---:|---|---:|---|---:|
| 1900 | undefined | 51 | undefined | 14 |
| 1920 | undefined | 50 | undefined | 4 |
| 1940 | undefined | 42 | undefined | 0 |
| 1960 | undefined | 52 | undefined | 10 |
| 1980 | undefined | 48 | undefined | 6 |
| 2000 | undefined | 49 | undefined | 5 |
| 2025 | undefined | 55 | undefined | 12 |

## Review Notes

- This is not yet a before/after diff across multiple committed models.
- It establishes the review surface needed to compare later model versions.
- Future versions should preserve prior model outputs or add a model replay command.

