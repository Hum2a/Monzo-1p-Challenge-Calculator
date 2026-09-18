"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { EmailPrefs } from "@/lib/validation";
import { formatPenceAsGBP, type ChallengeConfig } from "@/lib/pennyChallenge";
import { nextTransferPreview } from "@/lib/monthlyTransferEmail";

type PrefsStatus = "idle" | "loading" | "saving" | "saved" | "error";

type Props = {
  challengeStart: string;
  challengeLength: number;
  basePence: number;
};

export function MonthlyEmailPrefs({
  challengeStart,
  challengeLength,
  basePence,
}: Props) {
  const { data: session, status: sessionStatus } = useSession();
  const [enabled, setEnabled] = React.useState(false);
  const [savedStart, setSavedStart] = React.useState<string | null>(null);
  const [savedEnabled, setSavedEnabled] = React.useState(false);
  const [status, setStatus] = React.useState<PrefsStatus>("idle");
  const [loaded, setLoaded] = React.useState(false);

  const config: ChallengeConfig = React.useMemo(
    () => ({
      startDate: new Date(challengeStart),
      challengeLengthDays: challengeLength === 365 ? 365 : 364,
      basePence,
    }),
    [challengeStart, challengeLength, basePence]
  );

  const preview = React.useMemo(
    () => nextTransferPreview(config),
    [config]
  );

  React.useEffect(() => {
    if (!session?.user) {
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch("/api/account/email-prefs")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return res.json() as Promise<EmailPrefs>;
      })
      .then((data) => {
        if (cancelled) return;
        const on = data.monthlyEmailEnabled && Boolean(data.challengeStart);
        setEnabled(on);
        setSavedEnabled(on);
        setSavedStart(data.challengeStart ?? null);
        setLoaded(true);
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 2000);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  if (sessionStatus === "loading") {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading…
      </p>
    );
  }

  if (!session?.user) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium">Monthly Monzo reminder</p>
        <p className="text-sm text-muted-foreground">
          Sign in to get an email on the 1st with how much to transfer this
          month, based on your challenge start date.
        </p>
        <Button asChild size="sm">
          <Link href="/auth/signin">Sign in to get a 1st-of-month reminder</Link>
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    setStatus("saving");
    try {
      const body: EmailPrefs = {
        monthlyEmailEnabled: enabled,
        challengeStart,
        challengeLength: challengeLength === 365 ? 365 : 364,
        basePence,
      };
      const res = await fetch("/api/account/email-prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as EmailPrefs;
      const on = data.monthlyEmailEnabled && Boolean(data.challengeStart);
      setEnabled(on);
      setSavedEnabled(on);
      setSavedStart(data.challengeStart ?? null);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const previewLabel = preview
    ? `On 1 ${format(new Date(preview.year, preview.month - 1, 1), "MMMM yyyy")}, transfer ${formatPenceAsGBP(preview.result.totalPence)} (days ${preview.result.firstDay}–${preview.result.lastDay}).`
    : "That month sits outside your challenge period — adjust the start date above.";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {previewLabel}
      </p>

      {savedEnabled && savedStart && (
        <p className="text-xs text-muted-foreground">
          On for start {savedStart}. Saving again updates the reminder to the
          challenge settings above.
        </p>
      )}

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          id="monthly-email-enabled"
          type="checkbox"
          className="mt-1 size-4 accent-[var(--primary)]"
          checked={enabled}
          disabled={status === "loading" || !loaded}
          onChange={(e) => setEnabled(e.target.checked)}
          aria-describedby="monthly-email-help"
        />
        <span>
          <span className="text-sm font-medium">
            Email me this amount on the 1st
          </span>
          <span id="monthly-email-help" className="block text-xs text-muted-foreground mt-0.5">
            Around 08:00 UTC on the 1st of each month, using your saved start date.
          </span>
        </span>
      </label>

      <Button
        type="button"
        size="sm"
        onClick={handleSave}
        disabled={status === "saving" || status === "loading" || !loaded}
        aria-label="Save monthly transfer reminder"
      >
        {status === "saving"
          ? "Saving..."
          : status === "saved"
            ? "Saved!"
            : status === "error"
              ? "Couldn’t save"
              : "Save reminder"}
      </Button>
    </div>
  );
}
