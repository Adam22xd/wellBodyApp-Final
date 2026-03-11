import test from "node:test";
import assert from "node:assert/strict";
import {
  formatSelectedDate,
  getDateKey,
  getTodayDateValue,
} from "../src/utils/date.js";

test("getTodayDateValue returns YYYY-MM-DD", () => {
  assert.match(getTodayDateValue(), /^\d{4}-\d{2}-\d{2}$/);
});

test("getDateKey returns normalized date key", () => {
  assert.equal(getDateKey("2026-03-11T08:45:00.000Z"), "2026-03-11");
});

test("getDateKey returns empty string for invalid dates", () => {
  assert.equal(getDateKey("not-a-date"), "");
});

test("formatSelectedDate returns fallback label when input is missing", () => {
  assert.equal(formatSelectedDate(""), "Dzisiaj");
});

test("formatSelectedDate returns readable Polish date string", () => {
  const formatted = formatSelectedDate("2026-03-11");

  assert.match(formatted, /2026/);
});
