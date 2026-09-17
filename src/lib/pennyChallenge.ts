/**
 * Penny Challenge / 1p Accumulator - Pure math utilities
 * All amounts in integer pence. Day k = k pence (Day 1 = 1p).
 */

import {
  addDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";

/** Amount in pence for a given day number (1-indexed). Day 1 = 1p. */
export function amountForDay(dayNumber: number, basePence: number = 1): number {
  if (dayNumber < 1) return 0;
  return Math.round(dayNumber * basePence);
}

/**
 * Sum of amounts from day A to day B (inclusive) using arithmetic series.
 * Sum = (n/2) * (first + last) where n = count, first = day A pence, last = day B pence.
 * Using integers: sum from k=a to b of k = (b*(b+1) - a*(a-1)) / 2
 * For base 1p: sum = (b*(b+1) - (a-1)*a) / 2
 */
export function sumRangeInPence(
  firstDay: number,
  lastDay: number,
  basePence: number = 1
): number {
  if (firstDay > lastDay) return 0;
  if (firstDay < 1) firstDay = 1;
  // Sum from 1..lastDay minus sum from 1..(firstDay-1)
  // Sum 1..n = n*(n+1)/2
  const sumToN = (n: number) => Math.floor((n * (n + 1)) / 2) * basePence;
  return sumToN(lastDay) - sumToN(firstDay - 1);
}

export interface ChallengeConfig {
  startDate: Date;
  challengeLengthDays: number; // 364 or 365
  basePence?: number;
}

/** Convert a calendar date to a day number (1-indexed) within the challenge. */
export function dateToDayNumber(
  date: Date,
  config: ChallengeConfig
): number | null {
  const diff = differenceInDays(date, config.startDate);
  if (diff < 0 || diff >= config.challengeLengthDays) return null;
  return diff + 1;
}

/** Convert a day number to the calendar date. */
export function dayNumberToDate(
  dayNumber: number,
  config: ChallengeConfig
): Date {
  return addDays(config.startDate, dayNumber - 1);
}

export interface RangeResult {
  firstDay: number;
  lastDay: number;
  dayCount: number;
  totalPence: number;
  firstDayPence: number;
  lastDayPence: number;
}

/**
 * Compute totals for a range of day numbers (inclusive).
 * Supports "starting at day X" - pass firstDayOffset if user is already past day 1.
 */
export function computeRange(
  firstDay: number,
  lastDay: number,
  basePence: number = 1
): RangeResult {
  const clampedFirst = Math.max(1, firstDay);
  const clampedLast = Math.max(clampedFirst, lastDay);
  const dayCount = clampedLast - clampedFirst + 1;
  const totalPence = sumRangeInPence(clampedFirst, clampedLast, basePence);
  return {
    firstDay: clampedFirst,
    lastDay: clampedLast,
    dayCount,
    totalPence,
    firstDayPence: amountForDay(clampedFirst, basePence),
    lastDayPence: amountForDay(clampedLast, basePence),
  };
}

/**
 * Get daily amounts for a range (for breakdown). Returns array of [dayNumber, pence].
 * Virtualized-friendly: can be sliced for long ranges.
 */
export function getDailyAmounts(
  firstDay: number,
  lastDay: number,
  basePence: number = 1
): Array<{ day: number; pence: number }> {
  const result: Array<{ day: number; pence: number }> = [];
  const start = Math.max(1, firstDay);
  const end = Math.max(start, lastDay);
  for (let d = start; d <= end; d++) {
    result.push({ day: d, pence: amountForDay(d, basePence) });
  }
  return result;
}

/**
 * Compute result for "next N days" from a given start date.
 */
export function computeNextNDays(
  fromDate: Date,
  numDays: number,
  config: ChallengeConfig
): RangeResult | null {
  const firstDay = dateToDayNumber(fromDate, config);
  if (firstDay === null) return null;
  const lastDay = Math.min(firstDay + numDays - 1, config.challengeLengthDays);
  return computeRange(firstDay, lastDay, config.basePence ?? 1);
}

/**
 * Compute result for a specific month within the challenge year.
 */
export function computeForMonth(
  month: number,
  year: number,
  config: ChallengeConfig
): RangeResult | null {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const firstDay = dateToDayNumber(monthStart, config);
  const lastDay = dateToDayNumber(monthEnd, config);

  if (firstDay === null && lastDay === null) return null;
  if (firstDay !== null && lastDay === null)
    return computeRange(firstDay, config.challengeLengthDays, config.basePence ?? 1);
  if (firstDay === null && lastDay !== null)
    return computeRange(1, lastDay, config.basePence ?? 1);

  return computeRange(firstDay!, lastDay!, config.basePence ?? 1);
}

/**
 * Compute result for a custom date range.
 */
export function computeCustomRange(
  startDate: Date,
  endDate: Date,
  config: ChallengeConfig
): RangeResult | null {
  const firstDay = dateToDayNumber(startDate, config);
  const lastDay = dateToDayNumber(endDate, config);
  if (firstDay === null || lastDay === null) return null;
  return computeRange(firstDay, lastDay, config.basePence ?? 1);
}

/**
 * Total saved "so far" up to and including a given date.
 */
export function totalSavedUpTo(
  upToDate: Date,
  config: ChallengeConfig
): RangeResult | null {
  const lastDay = dateToDayNumber(upToDate, config);
  if (lastDay === null) return null;
  return computeRange(1, lastDay, config.basePence ?? 1);
}

/**
 * Format pence as GBP string (e.g. 1234 -> "£12.34")
 */
export function formatPenceAsGBP(pence: number): string {
  const pounds = Math.floor(pence / 100);
  const p = pence % 100;
  return `£${pounds}.${p.toString().padStart(2, "0")}`;
}
