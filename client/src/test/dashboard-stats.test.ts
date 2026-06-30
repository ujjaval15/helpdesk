import { describe, it, expect, vi } from "vitest";
import { formatDuration } from "../lib/ticket-constants";
import { averageResolutionMs, buildDailyCountsMap } from "../../../server/src/routes/tickets";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatDuration", () => {
  it("returns an em dash for null", () => {
    expect(formatDuration(null)).toBe("—");
  });

  it("rounds sub-minute durations to '< 1m'", () => {
    expect(formatDuration(20 * 1000)).toBe("< 1m");
  });

  it("formats minutes", () => {
    expect(formatDuration(45 * MIN)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(2 * HOUR + 15 * MIN)).toBe("2h 15m");
  });

  it("drops the minutes when on a whole hour", () => {
    expect(formatDuration(3 * HOUR)).toBe("3h");
  });

  it("formats days and hours", () => {
    expect(formatDuration(2 * DAY + 5 * HOUR)).toBe("2d 5h");
  });

  it("drops the hours when on a whole day", () => {
    expect(formatDuration(4 * DAY)).toBe("4d");
  });
});

describe("buildDailyCountsMap", () => {
  it("returns one entry per day for the requested range", () => {
    const result = buildDailyCountsMap([], 7);
    expect(result).toHaveLength(7);
    result.forEach((entry) => expect(entry.count).toBe(0));
  });

  it("counts tickets on the correct day", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tickets = [
      { createdAt: today },
      { createdAt: today },
      { createdAt: yesterday },
    ];

    const result = buildDailyCountsMap(tickets, 3);
    const todayEntry = result.find((e) => e.date === today.toISOString().slice(0, 10));
    const yesterdayEntry = result.find((e) => e.date === yesterday.toISOString().slice(0, 10));

    expect(todayEntry?.count).toBe(2);
    expect(yesterdayEntry?.count).toBe(1);
  });

  it("ignores tickets outside the range", () => {
    const old = new Date();
    old.setDate(old.getDate() - 60);
    const result = buildDailyCountsMap([{ createdAt: old }], 30);
    expect(result.every((e) => e.count === 0)).toBe(true);
  });
});

describe("averageResolutionMs", () => {
  it("returns null when there are no tickets", () => {
    expect(averageResolutionMs([])).toBeNull();
  });

  it("averages the createdAt → updatedAt span across tickets", () => {
    const base = new Date("2026-06-01T00:00:00Z");
    const tickets = [
      { createdAt: base, updatedAt: new Date(base.getTime() + 1 * HOUR) },
      { createdAt: base, updatedAt: new Date(base.getTime() + 3 * HOUR) },
    ];

    expect(averageResolutionMs(tickets)).toBe(2 * HOUR);
  });
});
