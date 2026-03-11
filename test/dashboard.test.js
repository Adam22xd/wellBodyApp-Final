import test from "node:test";
import assert from "node:assert/strict";
import {
  formatAddedTime,
  getTimeFrameLabel,
  sanitizeGoalInput,
} from "../src/utils/dashboard.js";

test("sanitizeGoalInput strips non-digits", () => {
  assert.equal(sanitizeGoalInput("12a3 ml"), "123");
});

test("getTimeFrameLabel matches breakfast range", () => {
  assert.equal(
    getTimeFrameLabel("2026-03-11T07:30:00"),
    "Sniadanie (6:00-10:00)",
  );
});

test("getTimeFrameLabel returns fallback outside ranges", () => {
  assert.equal(
    getTimeFrameLabel("2026-03-11T22:15:00"),
    "Poza planem",
  );
});

test("formatAddedTime returns hh:mm string", () => {
  assert.match(formatAddedTime("2026-03-11T07:05:00"), /^\d{2}:\d{2}$/);
});
