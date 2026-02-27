import { describe, it, expect } from "vitest";
import {
  amountForDay,
  sumRangeInPence,
  computeRange,
  getDailyAmounts,
  computeNextNDays,
  computeForMonth,
  computeCustomRange,
  totalSavedUpTo,
  formatPenceAsGBP,
  type ChallengeConfig,
} from "./pennyChallenge";

describe("amountForDay", () => {
  it("day 1 = 1p", () => expect(amountForDay(1)).toBe(1));
  it("day 100 = 100p", () => expect(amountForDay(100)).toBe(100));
  it("day 365 = 365p", () => expect(amountForDay(365)).toBe(365));
  it("day 0 = 0", () => expect(amountForDay(0)).toBe(0));
  it("day -1 = 0", () => expect(amountForDay(-1)).toBe(0));
  it("custom base 2p: day 10 = 20p", () => expect(amountForDay(10, 2)).toBe(20));
});

describe("sumRangeInPence", () => {
  it("days 1-1 = 1p", () => expect(sumRangeInPence(1, 1)).toBe(1));
  it("days 1-2 = 3p", () => expect(sumRangeInPence(1, 2)).toBe(3));
  it("days 1-10 = 55p", () => expect(sumRangeInPence(1, 10)).toBe(55));
  it("days 60-90: arithmetic series", () => {
    // Sum 60+61+...+90 = (90*91 - 59*60)/2 = (8190 - 3540)/2 = 2325
    expect(sumRangeInPence(60, 90)).toBe(2325);
  });
  it("days 1-364 = 364*365/2 = 66430", () => {
    expect(sumRangeInPence(1, 364)).toBe(66430);
  });
  it("days 1-365 = 365*366/2 = 66795", () => {
    expect(sumRangeInPence(1, 365)).toBe(66795);
  });
  it("first > last returns 0", () => expect(sumRangeInPence(10, 5)).toBe(0));
  it("custom base 2p: days 1-3 = 2+4+6 = 12", () =>
    expect(sumRangeInPence(1, 3, 2)).toBe(12));
});

describe("computeRange", () => {
  it("returns correct structure for days 60-90", () => {
    const r = computeRange(60, 90);
    expect(r.firstDay).toBe(60);
    expect(r.lastDay).toBe(90);
    expect(r.dayCount).toBe(31);
    expect(r.firstDayPence).toBe(60);
    expect(r.lastDayPence).toBe(90);
    expect(r.totalPence).toBe(2325);
  });
});

describe("getDailyAmounts", () => {
  it("days 1-3 returns 3 entries", () => {
    const arr = getDailyAmounts(1, 3);
    expect(arr).toHaveLength(3);
    expect(arr[0]).toEqual({ day: 1, pence: 1 });
    expect(arr[2]).toEqual({ day: 3, pence: 3 });
  });
});

const config364: ChallengeConfig = {
  startDate: new Date(2026, 0, 1),
  challengeLengthDays: 364,
};

const config365: ChallengeConfig = {
  startDate: new Date(2026, 0, 1),
  challengeLengthDays: 365,
};

describe("computeNextNDays", () => {
  it("from Jan 1, next 30 days = days 1-30", () => {
    const r = computeNextNDays(
      new Date(2026, 0, 1),
      30,
      config364
    );
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(1);
    expect(r!.lastDay).toBe(30);
    expect(r!.totalPence).toBe(sumRangeInPence(1, 30));
  });
  it("from Jan 15, next 10 days = days 15-24", () => {
    const r = computeNextNDays(
      new Date(2026, 0, 15),
      10,
      config364
    );
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(15);
    expect(r!.lastDay).toBe(24);
  });
});

describe("computeForMonth - 2026", () => {
  it("January 2026 (days 1-31)", () => {
    const r = computeForMonth(1, 2026, config364);
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(1);
    expect(r!.lastDay).toBe(31);
    expect(r!.totalPence).toBe(sumRangeInPence(1, 31));
  });
  it("February 2026 (days 32-59, leap year)", () => {
    const r = computeForMonth(2, 2026, config364);
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(32);
    expect(r!.lastDay).toBe(59); // 28 days in Feb 2026 (not leap)
  });
  it("March 2026 (days 60-90)", () => {
    const r = computeForMonth(3, 2026, config364);
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(60);
    expect(r!.lastDay).toBe(90);
    expect(r!.totalPence).toBe(2325);
  });
  it("December 2026 (days 335-364)", () => {
    const r = computeForMonth(12, 2026, config364);
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(335);
    expect(r!.lastDay).toBe(364);
  });
});

describe("computeCustomRange", () => {
  it("Jan 15 to Jan 20", () => {
    const r = computeCustomRange(
      new Date(2026, 0, 15),
      new Date(2026, 0, 20),
      config364
    );
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(15);
    expect(r!.lastDay).toBe(20);
    expect(r!.dayCount).toBe(6);
  });
});

describe("totalSavedUpTo", () => {
  it("up to Jan 10 = days 1-10", () => {
    const r = totalSavedUpTo(new Date(2026, 0, 10), config364);
    expect(r).not.toBeNull();
    expect(r!.firstDay).toBe(1);
    expect(r!.lastDay).toBe(10);
    expect(r!.totalPence).toBe(55);
  });
});

describe("364 vs 365 length", () => {
  it("364-day challenge ends Dec 30 2026", () => {
    const r = computeForMonth(12, 2026, config364);
    expect(r!.lastDay).toBe(364);
  });
  it("365-day challenge ends Dec 31 2026", () => {
    const r = computeForMonth(12, 2026, config365);
    expect(r!.lastDay).toBe(365);
  });
});

describe("formatPenceAsGBP", () => {
  it("1234 -> £12.34", () => expect(formatPenceAsGBP(1234)).toBe("£12.34"));
  it("1 -> £0.01", () => expect(formatPenceAsGBP(1)).toBe("£0.01"));
  it("100 -> £1.00", () => expect(formatPenceAsGBP(100)).toBe("£1.00"));
});
