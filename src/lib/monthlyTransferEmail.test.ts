import { describe, it, expect } from "vitest";
import {
  buildMonthlyTransferEmail,
  defaultChallengeStartIso,
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
