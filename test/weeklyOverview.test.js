import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWeeklyStats,
  createLastSevenDays,
} from "../src/utils/weeklyOverview.js";

test("createLastSevenDays returns 7 consecutive dates ending with selected date", () => {
  const dates = createLastSevenDays("2026-03-11");

  assert.equal(dates.length, 7);
  assert.equal(dates[0].toISOString().slice(0, 10), "2026-03-05");
  assert.equal(dates[6].toISOString().slice(0, 10), "2026-03-11");
});

test("buildWeeklyStats aggregates calories and water by day", () => {
  const stats = buildWeeklyStats(
    "2026-03-11",
    [
      { createdAt: "2026-03-11T08:00:00", calories: 200 },
      { createdAt: "2026-03-11T13:00:00", calories: 450 },
      { createdAt: "2026-03-10T09:00:00", calories: 300 },
    ],
    [
      { createdAt: "2026-03-11T09:00:00", amount: 250 },
      { createdAt: "2026-03-11T10:00:00", amount: 500 },
      { createdAt: "2026-03-09T10:00:00", amount: 300 },
    ],
  );

  const march11 = stats.find((day) => day.key === "2026-03-11");
  const march10 = stats.find((day) => day.key === "2026-03-10");
  const march9 = stats.find((day) => day.key === "2026-03-09");

  assert.equal(march11?.calories, 650);
  assert.equal(march11?.water, 750);
  assert.equal(march10?.calories, 300);
  assert.equal(march9?.water, 300);
});
