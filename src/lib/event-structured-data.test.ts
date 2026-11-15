import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEventStructuredData } from "./event-structured-data";
import type { PublicActivity } from "./public-activities.functions";

const activity: PublicActivity = {
  id: "test-event", title: "Filmfestival", description: "Samen films kijken", category: "Cultuur",
  starts_at: "2026-11-18T00:00:00+00:00", ends_at: null, location_name: "Schiedam",
  image_key: "cinema", image_url: null, source: "Externe agenda", source_url: null,
};

test("uses the displayed event photo as an absolute crawlable image", () => {
  assert.deepEqual(buildEventStructuredData(activity, "/assets/cinema.jpg", activity.description).image,
    ["https://www.dare2meet.nl/assets/cinema.jpg"]);
});
test("does not invent a time, end date, admission price, performer or organizer", () => {
  const data = buildEventStructuredData(activity, "/assets/cinema.jpg", activity.description);
  assert.equal(data.startDate, "2026-11-18");
  for (const key of ["endDate", "offers", "performer", "organizer"]) assert.equal(key in data, false);
});
test("includes a known end date only when it follows the start", () => {
  const timed = { ...activity, starts_at: "2026-11-18T18:00:00+01:00", ends_at: "2026-11-18T21:00:00+01:00" };
  assert.equal(buildEventStructuredData(timed, "/assets/cinema.jpg", timed.description).endDate, timed.ends_at);
  assert.equal("endDate" in buildEventStructuredData({ ...timed, ends_at: timed.starts_at }, "/assets/cinema.jpg", timed.description), false);
});