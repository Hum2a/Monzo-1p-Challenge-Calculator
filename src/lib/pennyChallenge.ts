/**
 * Penny Challenge / 1p Accumulator - Pure math utilities
 * All amounts in integer pence. Day k = k pence (Day 1 = 1p).
 */

import {
  addDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  format,
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

export interface DailyAmountRow {
  day: number;
  pence: number;
  isSwitchDay?: boolean;
  date?: Date;
  dateStr?: string;
  rate?: number;
}

/**
 * Get daily amounts for a range (for breakdown). Returns array of DailyAmountRow.
 * Virtualized-friendly: can be sliced for long ranges.
 */
export function getDailyAmounts(
  firstDay: number,
  lastDay: number,
  basePence: number = 1,
  switchDay?: number | null,
  switchBasePence?: number | null,
  config?: ChallengeConfig
): DailyAmountRow[] {
  const result: DailyAmountRow[] = [];
  const start = Math.max(1, firstDay);
  const end = Math.max(start, lastDay);
  const hasSwitch = switchDay != null && switchBasePence != null;
  for (let d = start; d <= end; d++) {
    const rate = hasSwitch && d >= switchDay ? switchBasePence! : basePence;
    const row: DailyAmountRow = {
      day: d,
      pence: amountForDay(d, basePence, switchDay, switchBasePence),
      ...(hasSwitch ? { isSwitchDay: d === switchDay } : {}),
    };
    if (config) {
      const date = dayNumberToDate(d, config);
      row.date = date;
      row.dateStr = format(date, "yyyy-MM-dd");
      row.rate = rate;
    }
    result.push(row);
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

export interface MonthBreakdownItem {
  month: number; // 1-12
  year: number;
  monthName: string; // e.g. "January"
  startDate: Date;
  endDate: Date;
  firstDay: number;
  lastDay: number;
  dayCount: number;
  totalPence: number;
  cumulativePence: number;
  percentOfAnnual: number;
  peakDay: number;
  peakDayPence: number;
  lowestDay: number;
  lowestDayPence: number;
  avgDailyPence: number;
  hasRateSwitch: boolean;
  activeRates: number[];
}

/**
 * Returns breakdown of all calendar months covering the challenge.
 * If specificYear is provided, restricts to the 12 calendar months of that year.
 */
export function getAllMonthsBreakdown(
  config: ChallengeConfig,
  specificYear?: number
): MonthBreakdownItem[] {
  const annualTotal = annualTotalPence(
    config.challengeLengthDays,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );

  const monthsToInspect: Array<{ month: number; year: number }> = [];

  if (specificYear != null) {
    for (let m = 1; m <= 12; m++) {
      monthsToInspect.push({ month: m, year: specificYear });
    }
  } else {
    // Span from challenge start to challenge end
    const challengeEndDate = dayNumberToDate(config.challengeLengthDays, config);
    let curr = startOfMonth(config.startDate);
    const end = startOfMonth(challengeEndDate);
    while (curr <= end) {
      monthsToInspect.push({
        month: curr.getMonth() + 1,
        year: curr.getFullYear(),
      });
      curr = addMonths(curr, 1);
    }
  }

  const items: MonthBreakdownItem[] = [];

  for (const { month, year } of monthsToInspect) {
    const mStart = startOfMonth(new Date(year, month - 1, 1));
    const mEnd = endOfMonth(new Date(year, month - 1, 1));

    // Clamp to challenge range
    const dStart = dateToDayNumber(mStart, config);
    const dEnd = dateToDayNumber(mEnd, config);

    if (dStart == null && dEnd == null) {
      // Check if month completely encloses the challenge or is outside
      const challengeStart = config.startDate;
      const challengeEnd = dayNumberToDate(config.challengeLengthDays, config);
      if (mStart > challengeEnd || mEnd < challengeStart) {
        continue;
      }
    }

    const firstDay = dStart != null ? dStart : 1;
    const lastDay = dEnd != null ? dEnd : config.challengeLengthDays;

    if (firstDay > lastDay) continue;

    const dayCount = lastDay - firstDay + 1;
    const totalPence = sumRangeInPence(
      firstDay,
      lastDay,
      config.basePence ?? 1,
      config.switchDay,
      config.switchBasePence
    );
    const cumulativePence = sumRangeInPence(
      1,
      lastDay,
      config.basePence ?? 1,
      config.switchDay,
      config.switchBasePence
    );
    const percentOfAnnual = annualTotal > 0 ? (totalPence / annualTotal) * 100 : 0;

    const firstDayPence = amountForDay(firstDay, config.basePence ?? 1, config.switchDay, config.switchBasePence);
    const lastDayPence = amountForDay(lastDay, config.basePence ?? 1, config.switchDay, config.switchBasePence);
    const lowestDayPence = Math.min(firstDayPence, lastDayPence);
    const peakDayPence = Math.max(firstDayPence, lastDayPence);

    const hasRateSwitch =
      config.switchDay != null &&
      config.switchBasePence != null &&
      config.switchDay >= firstDay &&
      config.switchDay <= lastDay;

    const activeRates: number[] = [];
    if (hasRateSwitch) {
      activeRates.push(config.basePence ?? 1, config.switchBasePence!);
    } else {
      const activeRate =
        config.switchDay != null && config.switchBasePence != null && firstDay >= config.switchDay
          ? config.switchBasePence
          : (config.basePence ?? 1);
      activeRates.push(activeRate);
    }

    items.push({
      month,
      year,
      monthName: format(mStart, "MMMM"),
      startDate: dayNumberToDate(firstDay, config),
      endDate: dayNumberToDate(lastDay, config),
      firstDay,
      lastDay,
      dayCount,
      totalPence,
      cumulativePence,
      percentOfAnnual,
      peakDay: lastDay,
      peakDayPence,
      lowestDay: firstDay,
      lowestDayPence,
      avgDailyPence: dayCount > 0 ? Math.round(totalPence / dayCount) : 0,
      hasRateSwitch,
      activeRates,
    });
  }

  return items;
}

export interface MultiMonthResult {
  months: number[];
  year: number;
  dayCount: number;
  totalPence: number;
  firstDay: number;
  lastDay: number;
  firstDayPence: number;
  lastDayPence: number;
  avgDailyPence: number;
  monthBreakdowns: MonthBreakdownItem[];
}

/**
 * Compute total and breakdown for a collection of months in a given year.
 */
export function computeForMonths(
  months: number[],
  year: number,
  config: ChallengeConfig
): MultiMonthResult | null {
  if (!months || months.length === 0) return null;
  const allMonths = getAllMonthsBreakdown(config, year);
  const selected = allMonths.filter((m) => months.includes(m.month));
  if (selected.length === 0) return null;

  const totalPence = selected.reduce((acc, m) => acc + m.totalPence, 0);
  const dayCount = selected.reduce((acc, m) => acc + m.dayCount, 0);
  const firstDay = Math.min(...selected.map((m) => m.firstDay));
  const lastDay = Math.max(...selected.map((m) => m.lastDay));

  return {
    months: [...months].sort((a, b) => a - b),
    year,
    dayCount,
    totalPence,
    firstDay,
    lastDay,
    firstDayPence: amountForDay(firstDay, config.basePence ?? 1, config.switchDay, config.switchBasePence),
    lastDayPence: amountForDay(lastDay, config.basePence ?? 1, config.switchDay, config.switchBasePence),
    avgDailyPence: dayCount > 0 ? Math.round(totalPence / dayCount) : 0,
    monthBreakdowns: selected,
  };
}

export type BudgetPresetId =
  | "this-month-remaining"
  | "next-month"
  | "next-7"
  | "next-14"
  | "next-30"
  | "next-60"
  | "next-90"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "christmas-countdown"
  | "rest-of-challenge";

export interface BudgetPresetOption {
  id: BudgetPresetId;
  label: string;
  category: "upcoming" | "monthly" | "milestone";
  description: string;
}

export const BUDGET_PRESETS: BudgetPresetOption[] = [
  { id: "this-month-remaining", label: "Rest of Month", category: "monthly", description: "From today to end of current month" },
  { id: "next-month", label: "Next Month", category: "monthly", description: "Upcoming calendar month" },
  { id: "next-7", label: "Next 7 Days", category: "upcoming", description: "7 days from today" },
  { id: "next-14", label: "Next 14 Days", category: "upcoming", description: "Fortnight from today" },
  { id: "next-30", label: "Next 30 Days", category: "upcoming", description: "30 days from today" },
  { id: "christmas-countdown", label: "Christmas / Q4", category: "milestone", description: "Nov 1 to Dec 31" },
  { id: "rest-of-challenge", label: "Rest of Year", category: "milestone", description: "Today until challenge ends" },
];

export interface PresetResolution {
  presetId: BudgetPresetId;
  label: string;
  startDate: Date;
  endDate: Date;
  firstDay: number;
  lastDay: number;
  result: RangeResult;
}

/**
 * Resolves a budget preset against a given challenge configuration and reference date.
 */
export function resolvePreset(
  presetId: BudgetPresetId,
  config: ChallengeConfig,
  referenceDate: Date = new Date()
): PresetResolution | null {
  const challengeStart = config.startDate;
  const challengeEnd = dayNumberToDate(config.challengeLengthDays, config);

  // Clamp reference date to challenge boundaries
  const ref = referenceDate < challengeStart
    ? challengeStart
    : referenceDate > challengeEnd
    ? challengeEnd
    : referenceDate;

  let start: Date;
  let end: Date;
  let label = "";

  switch (presetId) {
    case "this-month-remaining": {
      start = ref;
      end = endOfMonth(ref);
      if (end > challengeEnd) end = challengeEnd;
      label = `Rest of ${format(ref, "MMMM")}`;
      break;
    }
    case "next-month": {
      const nextMonth = addMonths(startOfMonth(ref), 1);
      start = nextMonth;
      end = endOfMonth(nextMonth);
      if (start > challengeEnd) return null;
      if (end > challengeEnd) end = challengeEnd;
      label = format(nextMonth, "MMMM yyyy");
      break;
    }
    case "next-7": {
      start = ref;
      end = addDays(ref, 6);
      if (end > challengeEnd) end = challengeEnd;
      label = "Next 7 Days";
      break;
    }
    case "next-14": {
      start = ref;
      end = addDays(ref, 13);
      if (end > challengeEnd) end = challengeEnd;
      label = "Next 14 Days";
      break;
    }
    case "next-30": {
      start = ref;
      end = addDays(ref, 29);
      if (end > challengeEnd) end = challengeEnd;
      label = "Next 30 Days";
      break;
    }
    case "next-60": {
      start = ref;
      end = addDays(ref, 59);
      if (end > challengeEnd) end = challengeEnd;
      label = "Next 60 Days";
      break;
    }
    case "next-90": {
      start = ref;
      end = addDays(ref, 89);
      if (end > challengeEnd) end = challengeEnd;
      label = "Next 90 Days";
      break;
    }
    case "q1": {
      const y = challengeStart.getFullYear();
      start = new Date(y, 0, 1);
      end = endOfMonth(new Date(y, 2, 1));
      label = `Q1 ${y} (Jan–Mar)`;
      break;
    }
    case "q2": {
      const y = challengeStart.getFullYear();
      start = new Date(y, 3, 1);
      end = endOfMonth(new Date(y, 5, 1));
      label = `Q2 ${y} (Apr–Jun)`;
      break;
    }
    case "q3": {
      const y = challengeStart.getFullYear();
      start = new Date(y, 6, 1);
      end = endOfMonth(new Date(y, 8, 1));
      label = `Q3 ${y} (Jul–Sep)`;
      break;
    }
    case "q4": {
      const y = challengeStart.getFullYear();
      start = new Date(y, 9, 1);
      end = endOfMonth(new Date(y, 11, 1));
      label = `Q4 ${y} (Oct–Dec)`;
      break;
    }
    case "christmas-countdown": {
      const y = challengeStart.getFullYear();
      start = new Date(y, 10, 1); // 1 Nov
      end = new Date(y, 11, 31); // 31 Dec
      label = `Christmas Countdown ${y} (Nov–Dec)`;
      break;
    }
    case "rest-of-challenge": {
      start = ref;
      end = challengeEnd;
      label = `Rest of Challenge (from ${format(ref, "d MMM")})`;
      break;
    }
  }

  // Ensure within challenge bounds
  if (start < challengeStart) start = challengeStart;
  if (end > challengeEnd) end = challengeEnd;
  if (start > end) return null;

  const firstDay = dateToDayNumber(start, config);
  const lastDay = dateToDayNumber(end, config);
  if (firstDay == null || lastDay == null) return null;

  const result = computeRange(
    firstDay,
    lastDay,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );

  return {
    presetId,
    label,
    startDate: start,
    endDate: end,
    firstDay,
    lastDay,
    result,
  };
}

export interface BudgetStats {
  totalPence: number;
  dayCount: number;
  avgDailyPence: number;
  avgWeeklyPence: number;
  lowestDay: number;
  lowestDayPence: number;
  peakDay: number;
  peakDayPence: number;
  hasRateSwitch: boolean;
  preSwapPence?: number;
  postSwapPence?: number;
}

export function computeBudgetStats(
  firstDay: number,
  lastDay: number,
  config: ChallengeConfig
): BudgetStats {
  const clampedFirst = Math.max(1, firstDay);
  const clampedLast = Math.max(clampedFirst, lastDay);
  const dayCount = clampedLast - clampedFirst + 1;
  const totalPence = sumRangeInPence(
    clampedFirst,
    clampedLast,
    config.basePence ?? 1,
    config.switchDay,
    config.switchBasePence
  );

  const firstDayPence = amountForDay(clampedFirst, config.basePence ?? 1, config.switchDay, config.switchBasePence);
  const lastDayPence = amountForDay(clampedLast, config.basePence ?? 1, config.switchDay, config.switchBasePence);
  const lowestDayPence = Math.min(firstDayPence, lastDayPence);
  const peakDayPence = Math.max(firstDayPence, lastDayPence);

  const hasRateSwitch =
    config.switchDay != null &&
    config.switchBasePence != null &&
    config.switchDay > clampedFirst &&
    config.switchDay <= clampedLast;

  let preSwapPence: number | undefined;
  let postSwapPence: number | undefined;

  if (hasRateSwitch && config.switchDay != null) {
    preSwapPence = sumRangeInPence(clampedFirst, config.switchDay - 1, config.basePence ?? 1);
    postSwapPence = sumRangeInPence(config.switchDay, clampedLast, config.switchBasePence!);
  }

  const avgDailyPence = dayCount > 0 ? Math.round(totalPence / dayCount) : 0;
  const avgWeeklyPence = Math.round(avgDailyPence * 7);

  return {
    totalPence,
    dayCount,
    avgDailyPence,
    avgWeeklyPence,
    lowestDay: clampedFirst,
    lowestDayPence,
    peakDay: clampedLast,
    peakDayPence,
    hasRateSwitch,
    preSwapPence,
    postSwapPence,
  };
}

/**
 * Generate CSV export string for a set of daily rows.
 */
export function generateBreakdownCSV(
  rows: DailyAmountRow[],
  config: ChallengeConfig
): string {
  const lines: string[] = [
    "Day Number,Date,Daily Deposit,Cumulative Saved,Daily Rate Tier",
  ];
  let runningTotal = 0;
  if (rows.length > 0 && rows[0].day > 1) {
    runningTotal = sumRangeInPence(
      1,
      rows[0].day - 1,
      config.basePence ?? 1,
      config.switchDay,
      config.switchBasePence
    );
  }

  for (const row of rows) {
    runningTotal += row.pence;
    const dateStr =
      row.dateStr ||
      (row.date
        ? format(row.date, "yyyy-MM-dd")
        : format(dayNumberToDate(row.day, config), "yyyy-MM-dd"));
    const rateVal =
      row.rate ??
      (config.switchDay != null && config.switchBasePence != null && row.day >= config.switchDay
        ? config.switchBasePence
        : (config.basePence ?? 1));
    lines.push(
      `${row.day},${dateStr},${formatPenceAsGBP(row.pence)},${formatPenceAsGBP(runningTotal)},${rateVal}p/day (+${rateVal}p)`
    );
  }
  return lines.join("\n");
}

