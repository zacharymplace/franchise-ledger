# Franchise Ledger Scoring Methodology

## Purpose

The Franchise Ledger score is an experimental framework for comparing franchise seasons across eras using a small set of interpretable components.

The goal is not historical truth.

The goal is:

- consistency
- explainability
- repeatability
- model iteration through review and replay

All scores should be considered model outputs rather than authoritative rankings.

---

## Current Model

Configuration source:

```text
config/scoring-model-v0.2.json
```

The composite score is generated from weighted components.

---

## Component: Regular Season Strength

Purpose:

Measure how strong a team performed during the regular season.

Current signal:

- wins
- losses
- winning percentage

Assumption:

Regular-season performance remains the largest single driver of franchise strength.

---

## Component: Postseason Bonus

Purpose:

Reward teams that advanced beyond the regular season.

Current signals:

- postseason appearance
- pennant
- championship

Assumption:

Postseason success matters but should not completely dominate the score.

---

## Component: Era Adjustment

Purpose:

Normalize teams against the environment in which they played.

Current implementation:

- compares team winning percentage against the average winning percentage of teams in the same season

Assumption:

A team should be evaluated relative to its competitive environment rather than raw record alone.

Current status:

Experimental.
Likely to evolve.

---

## Component: Consistency

Purpose:

Reduce score volatility and smooth component behavior.

Current implementation:

Average of major score drivers.

Assumption:

Strong teams should score well across multiple dimensions rather than a single outlier metric.

Current status:

Experimental.
Likely to evolve.

---

## Grades

Scores are converted into letter grades using the configured grade scale.

Current grade boundaries are defined in:

```txt
config/scoring-model-v0.2.json
```

Grades are presentation outputs and do not affect scoring.

---

## Replay and Diff Process

Before changing the score model:

  1. Update the active scoring config.
  2. Run replay analysis.
  3. Review score movement.
  4. Decide whether the change improves the model.
  5. Promote the baseline only after reviews.

Commands:

```bash
npm run scoring-model-diff
npm run verify-full-lahman
```

Outputs:

```txt
reports/scoring-model-diff-report.md
reports/scoring-comparison-report.md
```

---

## Known Limitations

Current model does not yet incorporate:

- strength of schedule
- league size adjustments
- franchise continuity weighting
- dynasty effects
- multi-season rolling performance
- roster quality
- run differential
- advanced baseball metrics

These may be added in future versions if they improve explanatory power.

---

## Model Philosophy

Prefer:

- explainable
- testable
- replayable
- versioned

Avoid:

- opaque scoring
- hidden weights
- non-reproducible rankings
