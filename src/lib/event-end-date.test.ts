import { test } from "node:test";
import assert from "node:assert/strict";
import { knownEventEnd } from "./event-end-date";

test("preserves an explicit source end time in UTC", () => {
  assert.equal(knownEventEnd("2026-11-18T21:00:00+01:00", "2026-11-18T18:00:00Z"), "2026-11-18T20:00:00.000Z");
});
test("never infers missing, date-only, unzoned or earlier end times", () => {
  for (const value of [undefined, null, "2026-11-18", "2026-11-18T21:00:00", "2026-11-18T17:00:00Z"])
    assert.equal(knownEventEnd(value, "2026-11-18T18:00:00Z"), null);
});