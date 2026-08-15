# Franchise Ledger UI Dashboard Spec

## Purpose

Provide a single operational view of:

- scoring model status
- artifact health
- replay/diff analysis
- full dataset verification
- methodology governance

The dashboard is intended for model review and confidence verification, not public presentation.

---

# Dashboard Layout

## Header

Display:

- Active scoring model version
- Baseline scoring model version
- Last artifact generation timestamp
- Last full dataset verification timestamp

Status badges:

- Docs Check
- Artifact Check
- Drift Check
- Replay/Diff Check
- Full Lahman Verification

Each badge:

```text
PASS
WARN
FAIL
```

---

## Section 1: Scoring Model

Purpose:

Understand the currently active model.

Display:

- Active config file
- Baseline config file
- Component weights

Example:

Regular Season Strength
Postseason Bonus
Era Adjustment
Consistency

Show:

- weight
- description
- contribution %

Controls:

- View active config
- View baseline config
- Open methodology

---

## Section 2: Replay / Diff Review

Purpose:

Review model changes before baseline promotion.

Inputs:

- active config
- baseline config

Artifacts:

scoring-model-diff-report.md

Display:

- Compared scores
- Largest composite movers
- Grade changes
- Promotions
- Demotions

Visuals:

- Top positive deltas
- Top negative deltas

---

## Section 3: Scoring Comparison

Artifact:

scoring-comparison-report.md

Display:

- Componenet driver snapshot
- Season leaders
- Composite leaders

Visuals:

- Component breakdown
- Composite rankings

---

## Section 4: Generated Artifacts

Display:

Reports:

- annual report
- race report
- scoring comparison
- scoring diff

Exports:

- season scores
- race timeline
- chart exports

Status:

PASS/WARN/FAIL

---

## Section 5: Full Dataset Verification

Purpose:

Provide confidence against complete local data.

Inputs:

- Full Lahman dataset

Verification:

- record count
- score count
- race point count
- replay/diff execution

Display:

Records
Scores
Race Points
Seasons
Franchises

Expected current values:

Records: 2815
Scores: 2815
Seasons: 148
Franchises: 30

---

## Section 6: Governance

Display:

Methodology docs:

- scoring-methodology.md

Validation status:

- methodology validator
- workflow validator
- README duplication validator

Purpose:

Prevent undocumented scoring behavior.

---

## Review Workflow

Developer modifies:

- scoring model
- replay logic
- validation logic

Run:

`npm run docs-check`

Run:

`npm run check`

Optional:

`npm run full-check`

Review:

- scoring comparison report
- scoring model diff report

Promote baseline only after review.

---

## Future Enhancements

Potential additions:

- strength of schedule
- dynasty scoring
- franchise continuity
- rolling multi-year performance
- run differential
- advanced metrics
- historical model registry
- model version explorer
- interactive replay visualizations
