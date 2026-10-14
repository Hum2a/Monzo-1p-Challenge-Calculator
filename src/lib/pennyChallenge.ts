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
export function amountForDay(
  dayNumber: number,
  basePence: number = 1,
  switchDay?: number | null,
  switchBasePence?: number | null
): number {
  if (dayNumber < 1) return 0;
  const rate =
    switchDay != null && switchBasePence != null && dayNumber >= switchDay
      ? switchBasePence
      : basePence;
  return Math.round(dayNumber * rate);
}

/**
 * Sum of amounts from day A to day B (inclusive) using arithmetic series.
 * Supports an optional mid-challenge rate swap on switchDay to switchBasePence.
 */
export function sumRangeInPence(
  firstDay: number,
  lastDay: number,
  basePence: number = 1,
  switchDay?: number | null,
  switchBasePence?: number | null
): number {
  if (firstDay > lastDay) return 0;
  if (firstDay < 1) firstDay = 1;

  const sumSimple = (a: number, b: number, rate: number) => {
    if (a > b) return 0;
    const sumToN = (n: number) => Math.floor((n * (n + 1)) / 2) * rate;
    return sumToN(b) - sumToN(a - 1);
  };

  if (switchDay == null || switchBasePence == null) {
    return sumSimple(firstDay, lastDay, basePence);
  }

  // If switchDay is at or before firstDay, the entire range is at switchBasePence
  if (switchDay <= firstDay) {
    return sumSimple(firstDay, lastDay, switchBasePence);
  }

  // If switchDay is after lastDay, the entire range is at basePence
  if (switchDay > lastDay) {
    return sumSimple(firstDay, lastDay, basePence);
  }

  // Range spans across switchDay: [firstDay..switchDay-1] at basePence, [switchDay..lastDay] at switchBasePence
  return (
    sumSimple(firstDay, switchDay - 1, basePence) +
    sumSimple(switchDay, lastDay, switchBasePence)
  );
}

export interface MultiplierOption {
  multiplier: number;
  basePence: number;
  label: string;
  tierName: string;
  description: string;
}

export const MULTIPLIER_OPTIONS: readonly MultiplierOption[] = [
  { multiplier: 1, basePence: 1, label: "1p (1x)", tierName: "Standard", description: "+1p/day" },
  { multiplier: 2, basePence: 2, label: "2p (2x)", tierName: "Double", description: "+2p/day" },
  { multiplier: 3, basePence: 3, label: "3p (3x)", tierName: "Triple", description: "+3p/day" },
  { multiplier: 4, basePence: 4, label: "4p (4x)", tierName: "Max", description: "+4p/day" },
] as const;

/** Total pence for a full challenge year (364 or 365 days) at a given base pence (with optional switch). */
export function annualTotalPence(
  lengthDays: number = 365,
  basePence: number = 1,
  switchDay?: number | null,
  switchBasePence?: number | null
): number {
  return sumRangeInPence(1, lengthDays, basePence, switchDay, switchBasePence);
}

export interface ChallengeConfig {
  startDate: Date;
  challengeLengthDays: number; // 364 or 365
  basePence?: number;
  switchDay?: number | null;
  switchDate?: string | null;
  switchBasePence?: number | null;
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
  basePence: number = 1,
  switchDay?: number | null,
  switchBasePence?: number | null
): RangeResult {
  const clampedFirst = Math.max(1, firstDay);
  const clampedLast = Math.max(clampedFirst, lastDay);
  const dayCount = clampedLast - clampedFirst + 1;
  const totalPence = sumRangeInPence(
    clampedFirst,
    clampedLast,
    basePence,
    switchDay,
    switchBasePence
  );
  return {
    firstDay: clampedFirst,
    lastDay: clampedLast,
    dayCount,
    totalPence,
    firstDayPence: amountForDay(clampedFirst, basePence, switchDay, switchBasePence),
    lastDayPence: amountForDay(clampedLast, basePence, switchDay, switchBasePence),
  };
}

/**
 * Get daily amounts for a range (for breakdown). Returns array of { day, pence, isSwitchDay }.
 * Virtualized-friendly: can be sliced for long ranges.
 */
export function getDailyAmounts(
  firstDay: number,
  lastDay: number,
  basePence: number = 1,
  switchDay?: number | null,
  switchBasePence?: number | null
): Array<{ day: number; pence: number; isSwitchDay?: boolean }> {
  const result: Array<{ day: number; pence: number; isSwitchDay?: boolean }> = [];
  const start = Math.max(1, firstDay);
  const end = Math.max(start, lastDay);
  const hasSwitch = switchDay != null && switchBasePence != null;
  for (let d = start; d <= end; d++) {
    result.push({
      day: d,
      pence: amountForDay(d, basePence, switchDay, switchBasePence),
      ...(hasSwitch ? { isSwitchDay: d === switchDay } : {}),
    });
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
  return computeRange(
    firstDay,
    lastDay,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );
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
    return computeRange(
      firstDay,
      config.challengeLengthDays,
      config.basePence ?? 1,
      config.switchDay,
      config.switchBasePence
    );
  if (firstDay === null && lastDay !== null)
    return computeRange(
      1,
      lastDay,
      config.basePence ?? 1,
      config.switchDay,
      config.switchBasePence
    );

  return computeRange(
    firstDay!,
    lastDay!,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );
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
  return computeRange(
    firstDay,
    lastDay,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );
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
  return computeRange(
    1,
    lastDay,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );
}

/**
 * Format pence as GBP string (e.g. 1234 -> "£12.34")
 */
export function formatPenceAsGBP(pence: number): string {
  const pounds = Math.floor(pence / 100);
  const p = pence % 100;
  return `£${pounds}.${p.toString().padStart(2, "0")}`;
}

