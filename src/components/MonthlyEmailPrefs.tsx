"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmailPrefs } from "@/lib/validation";

type PrefsStatus = "idle" | "loading" | "saving" | "saved" | "error";

type Props = {
  /** Current calculator challenge fields — used when enabling / saving */
  challengeStart: string;
  challengeLength: number;
  basePence: number;
};

export function MonthlyEmailPrefs({
  challengeStart,
  challengeLength,
  basePence,
}: Props) {
  const { data: session } = useSession();
  const [enabled, setEnabled] = React.useState(true);
  const [prefStart, setPrefStart] = React.useState(challengeStart);
  const [prefLength, setPrefLength] = React.useState(challengeLength);
  const [prefBase, setPrefBase] = React.useState(basePence);
  const [status, setStatus] = React.useState<PrefsStatus>("idle");
  const [loaded, setLoaded] = React.useState(false);

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
        setEnabled(data.monthlyEmailEnabled);
        setPrefStart(data.challengeStart ?? challengeStart);
        setPrefLength(data.challengeLength === 365 ? 365 : 364);
        setPrefBase(data.basePence ?? 1);
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
    // Only reload when session identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  if (!session?.user) return null;

  const handleSave = async () => {
    setStatus("saving");
    try {
      const body: EmailPrefs = {
        monthlyEmailEnabled: enabled,
        challengeStart: prefStart || null,
        challengeLength: prefLength === 365 ? 365 : 364,
        basePence: prefBase,
      };
      const res = await fetch("/api/account/email-prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as EmailPrefs;
      setEnabled(data.monthlyEmailEnabled);
      setPrefStart(data.challengeStart ?? prefStart);
      setPrefLength(data.challengeLength === 365 ? 365 : 364);
      setPrefBase(data.basePence);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const useCalculatorSettings = () => {
    setPrefStart(challengeStart);
    setPrefLength(challengeLength === 365 ? 365 : 364);
    setPrefBase(basePence);
  };

  return (
    <div className="rounded-md border border-border p-3 space-y-3">
      <div className="flex items-start gap-2">
        <input
          id="monthly-email-enabled"
          type="checkbox"
          className="mt-1 size-4 accent-[var(--primary)]"
          checked={enabled}
          disabled={status === "loading" || !loaded}
          onChange={(e) => setEnabled(e.target.checked)}
          aria-describedby="monthly-email-help"
        />
        <div>
          <label htmlFor="monthly-email-enabled" className="text-sm font-medium">
            Email me on the 1st with this month&apos;s total
          </label>
          <p id="monthly-email-help" className="text-xs text-muted-foreground mt-0.5">
            On by default. Sent via Resend around 08:00 UTC on the 1st of each month.
          </p>
        </div>
      </div>

      {enabled && (
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="email-challenge-start" className="text-xs text-muted-foreground">
              Challenge start
            </label>
            <Input
              id="email-challenge-start"
              type="date"
              value={prefStart}
              onChange={(e) => setPrefStart(e.target.value)}
              aria-label="Challenge start date for emails"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email-challenge-length" className="text-xs text-muted-foreground">
              Length
            </label>
            <select
              id="email-challenge-length"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={prefLength}
              onChange={(e) => setPrefLength(Number(e.target.value))}
              aria-label="Challenge length for emails"
            >
              <option value={364}>364 days</option>
              <option value={365}>365 days</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="email-base-pence" className="text-xs text-muted-foreground">
              Base pence
            </label>
            <Input
              id="email-base-pence"
              type="number"
              min={1}
              max={100}
              value={prefBase}
              onChange={(e) => setPrefBase(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              aria-label="Base pence for emails"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={status === "saving" || status === "loading" || !loaded}
          aria-label="Save monthly email preferences"
        >
          {status === "saving"
            ? "Saving..."
            : status === "saved"
              ? "Saved!"
              : status === "error"
                ? "Error"
                : "Save email prefs"}
        </Button>
        {enabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={useCalculatorSettings}
            aria-label="Copy challenge settings from calculator"
          >
            Use calculator settings
          </Button>
        )}
      </div>
    </div>
  );
}
