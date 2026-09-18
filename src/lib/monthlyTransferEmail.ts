/**
 * Monthly transfer reminder emails via Resend.
 * Amounts in integer pence only.
 */

import { format } from "date-fns";
import {
  computeForMonth,
  formatPenceAsGBP,
  type ChallengeConfig,
  type RangeResult,
} from "@/lib/pennyChallenge";

export type UserEmailPrefs = {
  id: string;
  email: string | null;
  monthlyEmailEnabled: boolean;
  challengeStart: string | null;
  challengeLength: number;
  basePence: number;
};

export type MonthlyEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
  totalPence: number;
  result: RangeResult;
};

/** Parse YYYY-MM-DD as a local calendar date (matches Calculator / computeForMonth). */
export function parseChallengeStartDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Default challenge start: 1 Jan of the given year (local calendar). */
export function defaultChallengeStartIso(year: number): string {
  return `${year}-01-01`;
}

export function resolveChallengeConfig(
  prefs: Pick<UserEmailPrefs, "challengeStart" | "challengeLength" | "basePence">,
  year: number
): ChallengeConfig {
  const startIso = prefs.challengeStart ?? defaultChallengeStartIso(year);
  const length =
    prefs.challengeLength === 365 ? 365 : 364;
  const base =
    Number.isInteger(prefs.basePence) && prefs.basePence >= 1
      ? prefs.basePence
      : 1;

  return {
    startDate: parseChallengeStartDate(startIso),
    challengeLengthDays: length,
    basePence: base,
  };
}

/** True when the user opted in and saved a challenge start (signing in alone is not enough). */
export function isMonthlyEmailEligible(user: {
  monthlyEmailEnabled: boolean;
  email: string | null;
  challengeStart: string | null;
}): boolean {
  return (
    user.monthlyEmailEnabled &&
    typeof user.email === "string" &&
    user.email.includes("@") &&
    typeof user.challengeStart === "string" &&
    user.challengeStart.length > 0
  );
}

export type TransferPreview = {
  month: number;
  year: number;
  result: RangeResult;
};

/**
 * Preview for the next scheduled 1st-of-month email.
 * On the 1st, that email is for the current calendar month; otherwise the next month.
 */
export function nextTransferPreview(
  config: ChallengeConfig,
  now: Date = new Date()
): TransferPreview | null {
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (now.getDate() > 1) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  const result = computeForMonth(month, year, config);
  if (!result) return null;
  return { month, year, result };
}

export function buildMonthlyTransferEmail(opts: {
  email: string;
  month: number;
  year: number;
  result: RangeResult;
}): MonthlyEmailPayload {
  const { email, month, year, result } = opts;
  const monthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");
  const amount = formatPenceAsGBP(result.totalPence);
  const subject = `1p Challenge: transfer ${amount} for ${monthLabel}`;
  const text = [
    `Hi,`,
    ``,
    `For ${monthLabel}, transfer ${amount} into your Monzo pot for the 1p challenge.`,
    ``,
    `Days ${result.firstDay}–${result.lastDay} (${result.dayCount} days).`,
    `First day: ${formatPenceAsGBP(result.firstDayPence)} · Last day: ${formatPenceAsGBP(result.lastDayPence)}.`,
    ``,
    `— 1p Challenge Calculator`,
  ].join("\n");

  const html = `
    <p>Hi,</p>
    <p>For <strong>${monthLabel}</strong>, transfer <strong>${amount}</strong> into your Monzo pot for the 1p challenge.</p>
    <p>Days ${result.firstDay}–${result.lastDay} (${result.dayCount} days).<br/>
    First day: ${formatPenceAsGBP(result.firstDayPence)} · Last day: ${formatPenceAsGBP(result.lastDayPence)}.</p>
    <p>— 1p Challenge Calculator</p>
  `.trim();

  return {
    to: email,
    subject,
    text,
    html,
    totalPence: result.totalPence,
    result,
  };
}

export async function sendResendEmail(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.AUTH_RESEND_KEY;
  const from =
    process.env.AUTH_RESEND_FROM ??
    "1p Challenge <noreply@monzo-1p-challenge-calculator.online>";

  if (!apiKey) {
    return { ok: false, error: "AUTH_RESEND_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Resend ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
    };
  }

  return { ok: true };
}

export type MonthlyRunResult = {
  sent: number;
  skipped: number;
  errors: number;
};

/**
 * Email all opted-in users the transfer total for the given calendar month (UTC).
 */
export async function runMonthlyTransferEmails(
  month: number,
  year: number
): Promise<MonthlyRunResult> {
  const { db } = await import("@/lib/db");
  const users = await db.user.findMany({
    where: {
      monthlyEmailEnabled: true,
      email: { not: null },
      challengeStart: { not: null },
    },
    select: {
      id: true,
      email: true,
      monthlyEmailEnabled: true,
      challengeStart: true,
      challengeLength: true,
      basePence: true,
    },
  });

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    if (!isMonthlyEmailEligible(user) || !user.email) {
      skipped++;
      continue;
    }

    const config = resolveChallengeConfig(user, year);
    const result = computeForMonth(month, year, config);
    if (!result) {
      skipped++;
      continue;
    }

    const payload = buildMonthlyTransferEmail({
      email: user.email,
      month,
      year,
      result,
    });

    const sendResult = await sendResendEmail(payload);
    if (sendResult.ok) {
      sent++;
    } else {
      errors++;
      console.error("[monthly-transfer] send failed:", sendResult.error);
    }
  }

  return { sent, skipped, errors };
}
