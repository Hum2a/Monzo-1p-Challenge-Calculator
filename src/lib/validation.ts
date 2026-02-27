/**
 * Zod validation for all inputs: query params, form inputs, localStorage.
 * Never trust external input.
 */

import { z } from "zod";

const MAX_YEAR = 2100;
const MIN_YEAR = 2020;

/** Parse and validate date string (YYYY-MM-DD) */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .refine((s) => {
    const d = new Date(s + "T12:00:00Z");
    return !isNaN(d.getTime());
  }, "Invalid date");

/** Challenge length: 364 or 365 */
export const challengeLengthSchema = z
  .union([z.literal(364), z.literal(365)])
  .default(364);

/** Base pence per day (typically 1) */
export const basePenceSchema = z.number().int().min(1).max(100).default(1);

/** Number of days (for "next N days") */
export const numDaysSchema = z.number().int().min(1).max(365);

/** Month 1-12 */
export const monthSchema = z.number().int().min(1).max(12);

/** Year */
export const yearSchema = z.number().int().min(MIN_YEAR).max(MAX_YEAR);

/** Mode type */
export const modeSchema = z.enum(["next-n", "month", "custom"]);

/** Share link / URL query params - strict validation */
export const shareParamsSchema = z.object({
  mode: modeSchema.optional().default("next-n"),
  n: z.coerce.number().int().min(1).max(365).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(MIN_YEAR).max(MAX_YEAR).optional(),
  start: dateStringSchema.optional(),
  end: dateStringSchema.optional(),
  challengeStart: dateStringSchema.optional(),
  challengeLength: z.coerce.number().int().min(364).max(365).optional(),
  basePence: z.coerce.number().int().min(1).max(100).optional(),
  firstDayOffset: z.coerce.number().int().min(1).max(365).optional(),
});

export type ShareParams = z.infer<typeof shareParamsSchema>;

/** Validate URLSearchParams into ShareParams */
export function parseShareParams(
  searchParams: URLSearchParams | Record<string, string | undefined>
): ShareParams {
  const params: Record<string, string> = {};
  const set = (k: string, v: string) => {
    if (v !== "" && v !== undefined) params[k] = v;
  };
  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((v, k) => set(k, v));
  } else {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (typeof v === "string") set(k, v);
    });
  }
  return shareParamsSchema.parse(params);
}

/** Safe parse - returns null if invalid */
export function safeParseShareParams(
  searchParams: URLSearchParams | Record<string, string | undefined>
): ShareParams | null {
  try {
    return parseShareParams(searchParams);
  } catch {
    return null;
  }
}
