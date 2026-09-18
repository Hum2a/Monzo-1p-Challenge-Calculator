import { describe, it, expect } from "vitest";
import {
  buildMonthlyTransferEmail,
  defaultChallengeStartIso,
  isMonthlyEmailEligible,
  nextTransferPreview,
  parseChallengeStartDate,
  resolveChallengeConfig,
} from "./monthlyTransferEmail";
import { computeForMonth } from "./pennyChallenge";

describe("defaultChallengeStartIso", () => {
  it("returns Jan 1 of year", () => {
    expect(defaultChallengeStartIso(2026)).toBe("2026-01-01");
  });
});

describe("parseChallengeStartDate", () => {
  it("parses as local calendar date", () => {
    const d = parseChallengeStartDate("2026-01-01");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });
});

describe("resolveChallengeConfig", () => {
  it("uses defaults when challengeStart is null", () => {
    const config = resolveChallengeConfig(
      { challengeStart: null, challengeLength: 364, basePence: 1 },
      2026
    );
    expect(config.challengeLengthDays).toBe(364);
    expect(config.basePence).toBe(1);
    expect(config.startDate.getFullYear()).toBe(2026);
    expect(config.startDate.getMonth()).toBe(0);
    expect(config.startDate.getDate()).toBe(1);
  });

  it("clamps invalid length to 364", () => {
    const config = resolveChallengeConfig(
      { challengeStart: "2026-01-15", challengeLength: 999, basePence: 2 },
      2026
    );
    expect(config.challengeLengthDays).toBe(364);
    expect(config.basePence).toBe(2);
  });
});

describe("buildMonthlyTransferEmail", () => {
  it("includes GBP total and day range", () => {
    const config = resolveChallengeConfig(
      { challengeStart: "2026-01-01", challengeLength: 364, basePence: 1 },
      2026
    );
    const result = computeForMonth(3, 2026, config);
    expect(result).not.toBeNull();
    const email = buildMonthlyTransferEmail({
      email: "user@example.com",
      month: 3,
      year: 2026,
      result: result!,
    });
    expect(email.to).toBe("user@example.com");
    expect(email.totalPence).toBe(2325);
    expect(email.subject).toContain("£23.25");
    expect(email.subject).toContain("March 2026");
    expect(email.text).toContain("Days 60–90");
    expect(email.html).toContain("£23.25");
  });
});

describe("isMonthlyEmailEligible", () => {
  it("skips users without a saved challenge start", () => {
    expect(
      isMonthlyEmailEligible({
        monthlyEmailEnabled: true,
        email: "user@example.com",
        challengeStart: null,
      })
    ).toBe(false);
  });

  it("skips users who have not opted in", () => {
    expect(
      isMonthlyEmailEligible({
        monthlyEmailEnabled: false,
        email: "user@example.com",
        challengeStart: "2026-01-01",
      })
    ).toBe(false);
  });

  it("allows opted-in users with an email and start date", () => {
    expect(
      isMonthlyEmailEligible({
        monthlyEmailEnabled: true,
        email: "user@example.com",
        challengeStart: "2026-01-01",
      })
    ).toBe(true);
  });
});

describe("nextTransferPreview", () => {
  const config = resolveChallengeConfig(
    { challengeStart: "2026-01-01", challengeLength: 364, basePence: 1 },
    2026
  );

  it("uses the current month on the 1st", () => {
    const preview = nextTransferPreview(config, new Date(2026, 2, 1));
    expect(preview).not.toBeNull();
    expect(preview!.month).toBe(3);
    expect(preview!.year).toBe(2026);
    expect(preview!.result.totalPence).toBe(2325);
  });

  it("uses the next month after the 1st", () => {
    const preview = nextTransferPreview(config, new Date(2026, 1, 18));
    expect(preview).not.toBeNull();
    expect(preview!.month).toBe(3);
    expect(preview!.year).toBe(2026);
    expect(preview!.result.totalPence).toBe(2325);
  });

  it("rolls into the next year in December", () => {
    const preview = nextTransferPreview(config, new Date(2025, 11, 15));
    expect(preview).not.toBeNull();
    expect(preview!.month).toBe(1);
    expect(preview!.year).toBe(2026);
    expect(preview!.result.totalPence).toBe(496);
  });

  it("returns null when the next month is outside the challenge", () => {
    const preview = nextTransferPreview(config, new Date(2026, 11, 15));
    expect(preview).toBeNull();
  });
});
