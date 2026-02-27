"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { format, addDays } from "date-fns";
import {
  computeNextNDays,
  computeForMonth,
  computeCustomRange,
  computeRange,
  formatPenceAsGBP,
  type ChallengeConfig,
  type RangeResult,
} from "@/lib/pennyChallenge";
import { safeParseShareParams, type ShareParams } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DailyBreakdown } from "@/components/DailyBreakdown";
import { Copy, Share2, Save, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "next-n" | "month" | "custom";

const STORAGE_KEY = "penny-challenge-settings";

function loadFromStorage(): Partial<ShareParams> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed as Partial<ShareParams>;
  } catch {
    return {};
  }
}

function saveToStorage(params: ShareParams) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore
  }
}

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function defaultChallengeStart(year: number) {
  return format(new Date(year, 0, 1), "yyyy-MM-dd");
}

export function Calculator() {
  const currentYear = new Date().getFullYear();
  const [mode, setMode] = React.useState<Mode>("next-n");
  const [n, setN] = React.useState(30);
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [year, setYear] = React.useState(currentYear);
  const [fromDate, setFromDate] = React.useState(todayStr());
  const [customStart, setCustomStart] = React.useState(todayStr());
  const [customEnd, setCustomEnd] = React.useState(
    format(addDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [challengeStart, setChallengeStart] = React.useState(
    defaultChallengeStart(currentYear)
  );
  const [challengeLength, setChallengeLength] = React.useState(364);
  const [basePence, setBasePence] = React.useState(1);
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const [showPenceOnly, setShowPenceOnly] = React.useState(false);
  const [firstDayOffset, setFirstDayOffset] = React.useState<number | null>(null); // "I'm on day X"
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied">("idle");
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedStates, setSavedStates] = React.useState<Array<{ id: string; name: string | null; state: ShareParams; updatedAt: string }>>([]);
  const { data: session, status: sessionStatus } = useSession();

  // Hydrate from URL or localStorage
  React.useEffect(() => {
    const params = typeof window !== "undefined"
      ? safeParseShareParams(new URLSearchParams(window.location.search))
      : null;
    const stored = loadFromStorage();
    const merged = { ...stored, ...params };
    if (merged.mode) setMode(merged.mode as Mode);
    if (merged.n != null) setN(merged.n);
    if (merged.month != null) setMonth(merged.month);
    if (merged.year != null) setYear(merged.year);
    if (merged.start) setFromDate(merged.start);
    if (merged.start) setCustomStart(merged.start);
    if (merged.end) setCustomEnd(merged.end);
    if (merged.challengeStart) setChallengeStart(merged.challengeStart);
    if (merged.challengeLength != null) setChallengeLength(merged.challengeLength);
    if (merged.basePence != null) setBasePence(merged.basePence);
    if (merged.firstDayOffset != null) setFirstDayOffset(merged.firstDayOffset);
  }, []);

  const config: ChallengeConfig = React.useMemo(
    () => ({
      startDate: new Date(challengeStart),
      challengeLengthDays: challengeLength,
      basePence,
    }),
    [challengeStart, challengeLength, basePence]
  );

  const result: RangeResult | null = React.useMemo(() => {
    if (mode === "next-n") {
      // Advanced: "I'm on day X" - use day numbers directly
      if (firstDayOffset != null && firstDayOffset >= 1) {
        return computeRange(
          firstDayOffset,
          Math.min(firstDayOffset + n - 1, config.challengeLengthDays),
          basePence
        );
      }
      return computeNextNDays(new Date(fromDate), n, config);
    }
    if (mode === "month") {
      return computeForMonth(month, year, config);
    }
    return computeCustomRange(
      new Date(customStart),
      new Date(customEnd),
      config
    );
  }, [mode, n, fromDate, month, year, customStart, customEnd, config, firstDayOffset, basePence]);

  const shareParams: ShareParams = React.useMemo(
    () => ({
      mode,
      n: mode === "next-n" ? n : undefined,
      month: mode === "month" ? month : undefined,
      year: mode === "month" ? year : undefined,
      start: mode === "next-n" && firstDayOffset == null ? fromDate : mode === "custom" ? customStart : undefined,
      end: mode === "custom" ? customEnd : undefined,
      challengeStart,
      challengeLength,
      basePence,
      firstDayOffset: firstDayOffset ?? undefined,
    }),
    [mode, n, fromDate, month, year, customStart, customEnd, challengeStart, challengeLength, basePence, firstDayOffset]
  );

  React.useEffect(() => {
    saveToStorage(shareParams);
  }, [shareParams]);

  React.useEffect(() => {
    if (session?.user) {
      fetch("/api/saved")
        .then((r) => r.ok && r.json())
        .then((data) => data?.states && setSavedStates(data.states))
        .catch(() => {});
    } else {
      setSavedStates([]);
    }
  }, [session?.user]);

  const handleSave = async () => {
    if (!session?.user) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: shareParams }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveStatus("saved");
      const data = await res.json();
      setSavedStates((prev) => {
        const updated = prev.filter((s) => s.name !== (data.name ?? "Default"));
        return [{ id: data.id, name: data.name ?? "Default", state: shareParams, updatedAt: new Date().toISOString() }, ...updated];
      });
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleLoad = (s: { state: ShareParams }) => {
    const st = s.state as ShareParams;
    if (st.mode) setMode(st.mode as Mode);
    if (st.n != null) setN(st.n);
    if (st.month != null) setMonth(st.month);
    if (st.year != null) setYear(st.year);
    if (st.start) { setFromDate(st.start); setCustomStart(st.start); }
    if (st.end) setCustomEnd(st.end);
    if (st.challengeStart) setChallengeStart(st.challengeStart);
    if (st.challengeLength != null) setChallengeLength(st.challengeLength);
    if (st.basePence != null) setBasePence(st.basePence);
    setFirstDayOffset(st.firstDayOffset ?? null);
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?${new URLSearchParams(
        Object.entries(shareParams)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : "";

  const copyText = result
    ? [
        `1p Challenge: ${result.dayCount} days`,
        `First day: ${showPenceOnly ? `${result.firstDayPence}p` : formatPenceAsGBP(result.firstDayPence)}`,
        `Last day: ${showPenceOnly ? `${result.lastDayPence}p` : formatPenceAsGBP(result.lastDayPence)}`,
        `Total: ${showPenceOnly ? `${result.totalPence}p` : formatPenceAsGBP(result.totalPence)}`,
      ].join("\n")
    : "";

  const handleCopy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      // fallback ignored for simplicity
    }
  };

  const interpretation = result ? getInterpretation(mode, result, {
    n, fromDate, month, year, customStart, customEnd, showPenceOnly, firstDayOffset,
  }) : null;

  const formulaExplanation = result
    ? `Sum from day ${result.firstDay} to ${result.lastDay} = (${result.lastDay}×${result.lastDay + 1} − ${result.firstDay - 1}×${result.firstDay}) / 2 = ${result.totalPence} pence`
    : null;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-foreground">1p Challenge Calculator</CardTitle>
        <CardDescription>
          Day count starts from your start date as Day 1.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Challenge config - collapsible or inline */}
        <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground">Challenge settings</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="sr-only">Start date</span>
              <Input
                type="date"
                value={challengeStart}
                onChange={(e) => setChallengeStart(e.target.value)}
                aria-label="Challenge start date"
              />
            </label>
            <label className="block text-sm">
              <span className="sr-only">Challenge length</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={challengeLength}
                onChange={(e) => setChallengeLength(Number(e.target.value))}
                aria-label="Challenge length in days"
              >
                <option value={364}>364 days</option>
                <option value={365}>365 days</option>
              </select>
            </label>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3" aria-label="Calculation mode">
            <TabsTrigger value="next-n" id="tab-next-n">Next N days</TabsTrigger>
            <TabsTrigger value="month" id="tab-month">Month</TabsTrigger>
            <TabsTrigger value="custom" id="tab-custom">Custom range</TabsTrigger>
          </TabsList>

          <TabsContent value="next-n" aria-labelledby="tab-next-n">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstDayOffset != null}
                  onChange={(e) =>
                    setFirstDayOffset(e.target.checked ? 1 : null)
                  }
                  className="rounded border-input"
                  aria-label="I'm on a specific day number"
                />
                <span className="text-sm">I&apos;m on day number...</span>
              </label>
              {firstDayOffset != null ? (
                <label className="block">
                  <span className="text-sm font-medium">Current day in challenge</span>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={firstDayOffset}
                    onChange={(e) =>
                      setFirstDayOffset(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="mt-1"
                    aria-label="Current day number in challenge"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="text-sm font-medium">From date</span>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-1"
                  aria-label="Start from date"
                />
              </label>
              )}
              <label className="block">
                <span className="text-sm font-medium">Number of days</span>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={n}
                  onChange={(e) => setN(Number(e.target.value) || 1)}
                  className="mt-1"
                  aria-label="Number of days"
                />
              </label>
            </div>
          </TabsContent>

          <TabsContent value="month" aria-labelledby="tab-month">
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium">Month</span>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  aria-label="Month"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {format(new Date(2000, m - 1), "MMMM")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Year</span>
                <Input
                  type="number"
                  min={2020}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || currentYear)}
                  className="mt-1"
                  aria-label="Year"
                />
              </label>
            </div>
          </TabsContent>

          <TabsContent value="custom" aria-labelledby="tab-custom">
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium">Start date</span>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="mt-1"
                  aria-label="Range start date"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">End date</span>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="mt-1"
                  aria-label="Range end date"
                />
              </label>
            </div>
          </TabsContent>
        </Tabs>

        {/* Display toggle */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBreakdown}
              onChange={(e) => setShowBreakdown(e.target.checked)}
              className="rounded border-input"
              aria-label="Show daily breakdown"
            />
            <span className="text-sm">Show daily breakdown</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPenceOnly}
              onChange={(e) => setShowPenceOnly(e.target.checked)}
              className="rounded border-input"
              aria-label="Show amounts in pence only"
            />
            <span className="text-sm">Pence only</span>
          </label>
        </div>

        {/* Result */}
        {result ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <p className="text-2xl font-bold tabular-nums text-primary" aria-live="polite">
              {showPenceOnly ? `${result.totalPence}p` : formatPenceAsGBP(result.totalPence)}
            </p>
            {interpretation && (
              <p className="text-sm text-muted-foreground">{interpretation}</p>
            )}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">First day</dt>
              <dd className="font-medium tabular-nums">
                {showPenceOnly ? `${result.firstDayPence}p` : formatPenceAsGBP(result.firstDayPence)} (Day {result.firstDay})
              </dd>
              <dt className="text-muted-foreground">Last day</dt>
              <dd className="font-medium tabular-nums">
                {showPenceOnly ? `${result.lastDayPence}p` : formatPenceAsGBP(result.lastDayPence)} (Day {result.lastDay})
              </dd>
              <dt className="text-muted-foreground">Days</dt>
              <dd className="font-medium">{result.dayCount}</dd>
            </dl>
            {showBreakdown && (
              <DailyBreakdown
                firstDay={result.firstDay}
                lastDay={result.lastDay}
                basePence={basePence}
                showPenceOnly={showPenceOnly}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Select a range within your challenge period to see the total.
          </p>
        )}

        {formulaExplanation && (
          <Accordion type="single" collapsible>
            <AccordionItem value="formula">
              <AccordionTrigger>How is this calculated?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">{formulaExplanation}</p>
                <p className="text-sm mt-2">
                  The penny challenge uses an arithmetic series: day k = k pence. The sum from day a to day b is (b×(b+1) − (a−1)×a) ÷ 2 pence.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {session?.user && (
          <>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              aria-label="Save to account"
            >
              <Save className="size-4" />
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save to account"}
            </Button>
            {savedStates.length > 0 && (
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  const id = e.target.value;
                  const s = savedStates.find((x) => x.id === id);
                  if (s) handleLoad(s);
                }}
                aria-label="Load saved state"
              >
                <option value="">Load saved...</option>
                {savedStates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? "Default"} ({format(new Date(s.updatedAt), "d MMM")})
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        <Button
          variant="default"
          onClick={handleCopy}
          disabled={!result}
          aria-label="Copy result to clipboard"
        >
          <Copy className="size-4" />
          {copyStatus === "copied" ? "Copied!" : "Copy result"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (shareUrl) navigator.clipboard.writeText(shareUrl);
          }}
          disabled={!result}
          aria-label="Copy share link"
        >
          <Share2 className="size-4" />
          Share link
        </Button>
      </CardFooter>
    </Card>
  );
}

function getInterpretation(
  mode: Mode,
  r: RangeResult,
  opts: {
    n?: number;
    fromDate?: string;
    month?: number;
    year?: number;
    customStart?: string;
    customEnd?: string;
    showPenceOnly?: boolean;
    firstDayOffset?: number | null;
  }
): string {
  const fmt = (p: number) => opts.showPenceOnly ? `${p}p` : formatPenceAsGBP(p);
  if (mode === "month" && opts.month != null && opts.year != null) {
    const monthName = format(new Date(opts.year, opts.month - 1), "MMMM yyyy");
    return `For ${monthName} (days ${r.firstDay}–${r.lastDay}), you'll deposit ${fmt(r.totalPence)}.`;
  }
  if (mode === "next-n") {
    if (opts.firstDayOffset != null) {
      return `For the next ${opts.n} days starting from day ${opts.firstDayOffset}, you'll deposit ${fmt(r.totalPence)}.`;
    }
    return `For the next ${opts.n} days starting ${opts.fromDate}, you'll deposit ${fmt(r.totalPence)}.`;
  }
  if (mode === "custom" && opts.customStart && opts.customEnd) {
    return `From ${opts.customStart} to ${opts.customEnd} (${r.dayCount} days): ${fmt(r.totalPence)}.`;
  }
  return `Total for ${r.dayCount} days: ${fmt(r.totalPence)}.`;
}
