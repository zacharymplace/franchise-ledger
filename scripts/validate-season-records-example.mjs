import fs from "node:fs";

const data = JSON.parse(
  fs.readFileSync(
    "examples/example-season-records.json",
    "utf8"
  )
);

if (!Array.isArray(data.records) || data.records.length === 0) {
  throw new Error("records must be non-empty");
}

for (const record of data.records) {
  if (!record.franchiseId) throw new Error("missing franchiseId");
  if (!Number.isInteger(record.season)) throw new Error("invalid season");
  if (!Number.isInteger(record.wins)) throw new Error("invalid wins");
  if (!Number.isInteger(record.losses)) throw new Error("invalid losses");
}

console.log(
  "PASS: season record example valid (" +
    data.records.length +
    " records)"
);
