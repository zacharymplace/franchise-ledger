# Lahman Adapter

The Lahman season records adapter converts Lahman `Teams.csv` rows into Franchise Ledger season records.

## Input

Default path:

data/raw/lahman/Teams.csv

Alternate path:

node adapters/lahman-season-records-adapter.mjs path/to/Teams.csv

## Output

data/processed/lahman-season-records.json

## Normalized fields

- franchiseId
- season
- wins
- losses
- winPct
- postseasonReached
- pennant
- championship

## Notes

This adapter is intentionally conservative. Unknown historical franchise IDs are skipped until explicitly mapped.

## Example Dataset Limitations

`data/raw/lahman/example-Teams.csv` is an illustrative multi-era sample.

It is not an authoritative historical dataset and should not be used for published baseball analysis.

The sample exists to prove that the pipeline can:

- adapt Lahman-shaped rows
- normalize franchise IDs
- generate season records
- score season records
- export a race timeline
- generate readable reports

Real scoring should use the full Lahman `Teams.csv` file and reviewed franchise mappings.
