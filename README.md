# Franchise Ledger

A historical grading engine for sports organizations.

Initial scope:
- MLB organizations
- Annual franchise scores
- Legacy, current, and momentum indexes
- Racehorse-style historical visualization

v0.1 goal:
Create a transparent scoring methodology before ingesting live data.

## Command Pipeline

Run the full Franchise Ledger example pipeline:

npm run check

This command currently:

1. Adapts the committed Lahman example CSV into processed season records.
2. Generates markdown reports.
3. Generates frontend/export JSON artifacts.
4. Validates methodology, score examples, race timelines, Lahman outputs, and derived scores.

## Individual Commands

Adapt Lahman example data:

npm run adapt

Generate reports:

npm run report

Generate exports:

npm run export

Run validators:

npm run validate

## Current Generated Artifacts

Reports:

- reports/example-annual-score-report.md
- reports/example-race-timeline-report.md
- reports/lahman-derived-season-score-report.md
- reports/lahman-race-timeline-report.md

Exports:

- exports/example-race-chart-data.json
- exports/example-season-derived-scores.json
- exports/lahman-derived-season-scores.json
- exports/lahman-race-timeline.json

Processed data:

- data/processed/lahman-season-records.json

## Real Data Path

To run against real Lahman data, place `Teams.csv` here:

data/raw/lahman/Teams.csv

Then run:

node adapters/lahman-season-records-adapter.mjs data/raw/lahman/Teams.csv

The adapter writes:

data/processed/lahman-season-records.json

## Scoring Model Lifecycle

Franchise Ledger uses two scoring config files:

- `config/scoring-model-v0.2.json`
  - Active scoring model config.
  - Used by the normal Lahman scoring pipeline.

- `config/scoring-model-baseline-v0.2.json`
  - Baseline comparison config.
  - Used by the scoring replay/diff report.

Normal scoring flow:

```bash
npm run check
```

Scoring model review flow:

```bash
npm run scoring-model-diff
```

This writes:

```txt
reports/scoring-model-diff-report.md
```

Use this report to review how the active config differs from the baseline config.

For local full Lahman verification:

```bash
npm run verify-full-lahman
```

This confirms:

- full local Lahman artifacts exist
- records, scores, and race points align
- the replay/diff path works against the full local dataset

## Promoting a Scoring Baseline

Only promote the active scoring config to the baseline after reviewing the diff report and deciding the new model behavior is acceptable.

Promotion command:

```bash
cp config/scoring-model-v0.2.json config/scoring-model-baseline-v0.2.json
npm run check
```

Then commit both the baseline config change and any generated report updates.

Baseline promotion should be a separate commit from experimental model changes when possible.

## Full Local Confidence Gate

Run the committed artifact pipeline and local full Lahman verification with one command:

```bash
npm run full-check
```

## Manual Full-Check Workflow Dispatch

The normal Franchise Ledger CI check runs on pull requests and pushes to `main`.

The full Lahman verification path is available as a manual GitHub Actions workflow dispatch so it does not slow normal PR checks.

Manual workflow:

```text
GitHub → Actions → Franchise Ledger → Run workflow
```

The manual full-check job installs p7zip, downloads the full Lahman dataset, and runs:

```bash
npm run full-check
```

Use this when changing scoring logic, replay/diff behavior, Lahman ingestion, or full-dataset verification.

## Documentation Check

Run documentation-focused validators directly with:

```bash
npm run docs-check
```

This validates the scoring methodology documentation, Franchise Ledger workflow documentation, and UI dashboard spec without running the full generated-artifact pipeline.

## Race horse dashboard snapshot

The race horse dashboard snapshot is a lightweight generated artifact that records the dashboard-facing leaderboard state for review and drift detection.

- Artifact: `exports/race-horse-dashboard-snapshot.json`
- Generate: `npm run dashboard-snapshot`
- Validate: `npm run validate-dashboard-snapshot`
- Drift guard: `npm run dashboard-snapshot-drift`

The snapshot gives reviewers a stable, text-readable summary of the race horse visualization without needing to inspect the browser UI manually.

## Dashboard evidence packet

The dashboard evidence packet is a generated review note that summarizes the dashboard-facing standings and required validation evidence.

- Artifact: `reports/dashboard-evidence-packet.md`
- Generate: `npm run dashboard-evidence`
- Validate: `npm run validate-dashboard-evidence`
- Drift guard: `npm run dashboard-evidence-drift`

## Dashboard case-study note

The dashboard evidence case-study note explains how the generated dashboard evidence packet supports portfolio review and durable validation.

- Note: `case-studies/dashboard-evidence-note.md`
- Evidence packet: `reports/dashboard-evidence-packet.md`
