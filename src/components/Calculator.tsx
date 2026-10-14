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
  annualTotalPence,
  MULTIPLIER_OPTIONS,
  dateToDayNumber,
  dayNumberToDate,
  sumRangeInPence,
  type ChallengeConfig,
  type RangeResult,
} from "@/lib/pennyChallenge";
import { cn } from "@/lib/utils";
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
import { MonthlyEmailPrefs } from "@/components/MonthlyEmailPrefs";
import { BorderBeam } from "@/components/magicui/border-beam";
import { SlidingNumber } from "@/components/animate-ui/sliding-number";
import { Copy, Share2, Save } from "lucide-react";

type Mode = "next-n" | "month" | "custom";
type TabValue = Mode | "email";

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
  const [tab, setTab] = React.useState<TabValue>("next-n");
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
  const [hasSwitch, setHasSwitch] = React.useState(false);
  const [switchDay, setSwitchDay] = React.useState<number | null>(null);
  const [switchDate, setSwitchDate] = React.useState<string>(
    format(addDays(new Date(defaultChallengeStart(currentYear)), 90), "yyyy-MM-dd")
  );
  const [switchDayInputStr, setSwitchDayInputStr] = React.useState("91");
  const [switchBasePence, setSwitchBasePence] = React.useState(4);
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const [showPenceOnly, setShowPenceOnly] = React.useState(false);
  const [firstDayOffset, setFirstDayOffset] = React.useState<number | null>(null); // "I'm on day X"
  const [dayInputStr, setDayInputStr] = React.useState("1"); // local display for day input (allows empty while typing)
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied">("idle");
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedStates, setSavedStates] = React.useState<Array<{ id: string; name: string | null; state: ShareParams; updatedAt: string }>>([]);
  const { data: session } = useSession();

  // Hydrate from URL or localStorage
  React.useEffect(() => {
    const params = typeof window !== "undefined"
      ? safeParseShareParams(new URLSearchParams(window.location.search))
      : null;
    const stored = loadFromStorage();
    const merged = { ...stored, ...params };
    if (merged.mode) {
      setMode(merged.mode as Mode);
      setTab(merged.mode as Mode);
    }
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
    if (merged.switchDay != null || merged.switchDate != null || merged.switchBasePence != null) {
      setHasSwitch(true);
      if (merged.switchDay != null) {
        setSwitchDay(merged.switchDay);
        setSwitchDayInputStr(String(merged.switchDay));
      }
      if (merged.switchDate) setSwitchDate(merged.switchDate);
      if (merged.switchBasePence != null) setSwitchBasePence(merged.switchBasePence);
    }
  }, []);

  // Sync day input display when firstDayOffset is set externally (URL, load)
  React.useEffect(() => {
    if (firstDayOffset != null) setDayInputStr(String(firstDayOffset));
  }, [firstDayOffset]);

  const effectiveSwitchDay = React.useMemo(() => {
    if (!hasSwitch) return null;
    if (switchDay != null && switchDay >= 1) {
      return Math.min(switchDay, challengeLength);
    }
    try {
      const d = dateToDayNumber(new Date(switchDate), {
        startDate: new Date(challengeStart),
        challengeLengthDays: challengeLength,
      });
      if (d != null) return d;
    } catch {
      // ignore
    }
    return 91;
  }, [hasSwitch, switchDay, switchDate, challengeStart, challengeLength]);

  const config: ChallengeConfig = React.useMemo(
    () => ({
      startDate: new Date(challengeStart),
      challengeLengthDays: challengeLength,
      basePence,
      switchDay: hasSwitch ? effectiveSwitchDay : null,
      switchDate: hasSwitch ? switchDate : null,
      switchBasePence: hasSwitch ? switchBasePence : null,
    }),
    [challengeStart, challengeLength, basePence, hasSwitch, effectiveSwitchDay, switchDate, switchBasePence]
  );

  const effectiveDayOffset = firstDayOffset != null
    ? (dayInputStr === "" ? 1 : Math.max(1, Math.min(365, Number(dayInputStr) || 1)))
    : null;

  const result: RangeResult | null = React.useMemo(() => {
    if (mode === "next-n") {
      // Advanced: "I'm on day X" - use day numbers directly
      if (effectiveDayOffset != null && effectiveDayOffset >= 1) {
        return computeRange(
          effectiveDayOffset,
          Math.min(effectiveDayOffset + n - 1, config.challengeLengthDays),
          basePence,
          config.switchDay,
          config.switchBasePence
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
  }, [mode, n, fromDate, month, year, customStart, customEnd, config, effectiveDayOffset, basePence]);

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
      firstDayOffset: effectiveDayOffset ?? undefined,
      switchDay: hasSwitch && effectiveSwitchDay ? effectiveSwitchDay : undefined,
      switchDate: hasSwitch && switchDate ? switchDate : undefined,
      switchBasePence: hasSwitch ? switchBasePence : undefined,
    }),
    [mode, n, fromDate, month, year, customStart, customEnd, challengeStart, challengeLength, basePence, effectiveDayOffset, firstDayOffset, hasSwitch, effectiveSwitchDay, switchDate, switchBasePence]
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
    if (st.mode) {
      setMode(st.mode as Mode);
      setTab(st.mode as Mode);
    }
    if (st.n != null) setN(st.n);
    if (st.month != null) setMonth(st.month);
    if (st.year != null) setYear(st.year);
    if (st.start) { setFromDate(st.start); setCustomStart(st.start); }
    if (st.end) setCustomEnd(st.end);
    if (st.challengeStart) setChallengeStart(st.challengeStart);
    if (st.challengeLength != null) setChallengeLength(st.challengeLength);
    if (st.basePence != null) setBasePence(st.basePence);
    setFirstDayOffset(st.firstDayOffset ?? null);
    if (st.switchDay != null || st.switchDate != null || st.switchBasePence != null) {
      setHasSwitch(true);
      setSwitchDay(st.switchDay ?? null);
      if (st.switchDay != null) setSwitchDayInputStr(String(st.switchDay));
      if (st.switchDate) setSwitchDate(st.switchDate);
      if (st.switchBasePence != null) setSwitchBasePence(st.switchBasePence);
    } else {
      setHasSwitch(false);
      setSwitchDay(null);
    }
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
        hasSwitch && effectiveSwitchDay != null
          ? `1p Challenge (${basePence}p/day up to day ${effectiveSwitchDay - 1}, then ${switchBasePence}p/day): ${result.dayCount} days`
          : `1p Challenge${basePence > 1 ? ` (${basePence}p/day · ${basePence}x scale)` : ""}: ${result.dayCount} days`,
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
    n, fromDate, month, year, customStart, customEnd, showPenceOnly, firstDayOffset: effectiveDayOffset, basePence,
    switchDay: hasSwitch ? effectiveSwitchDay : null,
    switchBasePence: hasSwitch ? switchBasePence : null,
  }) : null;

  const formulaExplanation = result
    ? hasSwitch && effectiveSwitchDay != null
      ? result.lastDay < effectiveSwitchDay
        ? `Sum from day ${result.firstDay} to ${result.lastDay} = (${result.lastDay}×${result.lastDay + 1} − ${result.firstDay - 1}×${result.firstDay}) / 2 × ${basePence}p = ${result.totalPence} pence (${formatPenceAsGBP(result.totalPence)}) [before Day ${effectiveSwitchDay} switch]`
        : result.firstDay >= effectiveSwitchDay
        ? `Sum from day ${result.firstDay} to ${result.lastDay} = (${result.lastDay}×${result.lastDay + 1} − ${result.firstDay - 1}×${result.firstDay}) / 2 × ${switchBasePence}p = ${result.totalPence} pence (${formatPenceAsGBP(result.totalPence)}) [after Day ${effectiveSwitchDay} switch]`
        : `Sum split at Day ${effectiveSwitchDay}: [Days ${result.firstDay}–${effectiveSwitchDay - 1} at ${basePence}p = ${formatPenceAsGBP(sumRangeInPence(result.firstDay, effectiveSwitchDay - 1, basePence))}] + [Days ${effectiveSwitchDay}–${result.lastDay} at ${switchBasePence}p = ${formatPenceAsGBP(sumRangeInPence(effectiveSwitchDay, result.lastDay, switchBasePence))}] = ${result.totalPence} pence (${formatPenceAsGBP(result.totalPence)})`
      : basePence > 1
      ? `Sum from day ${result.firstDay} to ${result.lastDay} = [(${result.lastDay}×${result.lastDay + 1} − ${result.firstDay - 1}×${result.firstDay}) / 2] × ${basePence}p = ${result.totalPence} pence (${formatPenceAsGBP(result.totalPence)})`
      : `Sum from day ${result.firstDay} to ${result.lastDay} = (${result.lastDay}×${result.lastDay + 1} − ${result.firstDay - 1}×${result.firstDay}) / 2 = ${result.totalPence} pence`
    : null;

  return (
    <Card className="relative w-full max-w-lg mx-auto overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-lg shadow-black/5">
      <BorderBeam duration={10} />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-xl text-foreground">1p Challenge Calculator</CardTitle>
        <CardDescription>
          Day count starts from your start date as Day 1.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {/* Challenge config - collapsible or inline */}
        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Challenge settings</p>
            <span className="text-xs font-semibold text-primary tracking-wide bg-primary/10 px-2 py-0.5 rounded-full">
              {hasSwitch && effectiveSwitchDay != null
                ? `${basePence}p → ${switchBasePence}p (from day ${effectiveSwitchDay})`
                : `${basePence}x scale · +${basePence}p/day`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="sr-only">Start date</span>
              <Input
                type="date"
                value={challengeStart}
                onChange={(e) => {
                  const val = e.target.value;
                  setChallengeStart(val);
                  if (effectiveSwitchDay != null) {
                    setSwitchDate(format(dayNumberToDate(effectiveSwitchDay, { startDate: new Date(val), challengeLengthDays: challengeLength }), "yyyy-MM-dd"));
                  }
                }}
                aria-label="Challenge start date"
              />
            </label>
            <label className="block text-sm">
              <span className="sr-only">Challenge length</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors duration-200"
                value={challengeLength}
                onChange={(e) => setChallengeLength(Number(e.target.value))}
                aria-label="Challenge length in days"
              >
                <option value={364}>
                  364 days ({formatPenceAsGBP(annualTotalPence(364, basePence, hasSwitch ? effectiveSwitchDay : null, hasSwitch ? switchBasePence : null))})
                </option>
                <option value={365}>
                  365 days ({formatPenceAsGBP(annualTotalPence(365, basePence, hasSwitch ? effectiveSwitchDay : null, hasSwitch ? switchBasePence : null))})
                </option>
              </select>
            </label>
          </div>

          {/* Daily scale multiplier selector */}
          <div className="pt-1 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {hasSwitch ? "Starting daily rate" : "Daily scaling rate (Monzo Extra / Perks / Max)"}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                Day 1: {formatPenceAsGBP(basePence)}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Starting daily scaling rate multiplier"
              className="grid grid-cols-4 gap-2"
            >
              {MULTIPLIER_OPTIONS.map((opt) => {
                const isSelected = basePence === opt.basePence;
                return (
                  <button
                    key={opt.multiplier}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    id={`scale-option-${opt.multiplier}`}
                    onClick={() => setBasePence(opt.basePence)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25 ring-1 ring-primary"
                        : "bg-background/90 text-foreground border border-input hover:bg-muted/80"
                    )}
                  >
                    <span className="text-sm font-bold tracking-tight">
                      {opt.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] tracking-tight",
                        isSelected ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"
                      )}
                    >
                      {opt.tierName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mid-challenge rate switch toggle & configuration */}
          <div className="pt-2 border-t border-border/60">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="toggle-rate-switch"
                checked={hasSwitch}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasSwitch(checked);
                  if (checked && switchDay == null) {
                    setSwitchDay(91);
                    setSwitchDayInputStr("91");
                    setSwitchDate(format(dayNumberToDate(91, { startDate: new Date(challengeStart), challengeLengthDays: challengeLength }), "yyyy-MM-dd"));
                    if (switchBasePence === basePence) {
                      setSwitchBasePence(basePence === 1 ? 4 : 1);
                    }
                  }
                }}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span className="text-xs font-medium text-foreground">
                Swapped rate mid-challenge? (e.g. upgraded to 4p)
              </span>
            </label>

            {hasSwitch && effectiveSwitchDay != null && (
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/40 transition-all">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-xs">
                    <span className="font-medium text-foreground block mb-1">
                      Swap on date
                    </span>
                    <Input
                      type="date"
                      value={switchDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSwitchDate(val);
                        if (val) {
                          const d = dateToDayNumber(new Date(val), { startDate: new Date(challengeStart), challengeLengthDays: challengeLength });
                          if (d != null) {
                            setSwitchDay(d);
                            setSwitchDayInputStr(String(d));
                          }
                        }
                      }}
                      aria-label="Date when daily rate swapped"
                      className="h-9 text-xs"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="font-medium text-foreground block mb-1">
                      Swap on day number
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={challengeLength}
                      value={switchDayInputStr}
                      onChange={(e) => {
                        setSwitchDayInputStr(e.target.value);
                        const parsed = Number(e.target.value);
                        if (parsed >= 1 && parsed <= challengeLength) {
                          setSwitchDay(parsed);
                          setSwitchDate(format(dayNumberToDate(parsed, { startDate: new Date(challengeStart), challengeLengthDays: challengeLength }), "yyyy-MM-dd"));
                        }
                      }}
                      onBlur={() => {
                        const parsed = Math.max(1, Math.min(challengeLength, Number(switchDayInputStr) || 1));
                        setSwitchDay(parsed);
                        setSwitchDayInputStr(String(parsed));
                        setSwitchDate(format(dayNumberToDate(parsed, { startDate: new Date(challengeStart), challengeLengthDays: challengeLength }), "yyyy-MM-dd"));
                      }}
                      aria-label="Challenge day number when daily rate swapped"
                      className="h-9 text-xs"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      New rate from Day {effectiveSwitchDay} ({switchDate}) onwards
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      +{switchBasePence}p/day ({switchBasePence}x)
                    </span>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="New daily rate multiplier"
                    className="grid grid-cols-4 gap-2"
                  >
                    {MULTIPLIER_OPTIONS.map((opt) => {
                      const isSelected = switchBasePence === opt.basePence;
                      return (
                        <button
                          key={opt.multiplier}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          id={`new-scale-option-${opt.multiplier}`}
                          onClick={() => setSwitchBasePence(opt.basePence)}
                          className={cn(
                            "flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-xs transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25 ring-1 ring-primary"
                              : "bg-background/90 text-foreground border border-input hover:bg-muted/80"
                          )}
                        >
                          <span className="text-xs font-bold tracking-tight">
                            {opt.label}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] tracking-tight",
                              isSelected ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"
                            )}
                          >
                            {opt.tierName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-md bg-muted/60 p-2.5 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <span>
                    Days 1–{effectiveSwitchDay - 1} at {basePence}p/day → Days {effectiveSwitchDay}–{challengeLength} at {switchBasePence}p/day
                  </span>
                  <span className="font-semibold text-foreground">
                    Year total: {formatPenceAsGBP(annualTotalPence(challengeLength, basePence, effectiveSwitchDay, switchBasePence))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v: string) => {
            const next = v as TabValue;
            setTab(next);
            if (next !== "email") setMode(next);
          }}
          className="w-full"
        >
          <TabsList value={tab} className="grid w-full grid-cols-4" aria-label="Calculator tabs">
            <TabsTrigger value="next-n" id="tab-next-n">Days</TabsTrigger>
            <TabsTrigger value="month" id="tab-month">Month</TabsTrigger>
            <TabsTrigger value="custom" id="tab-custom">Range</TabsTrigger>
            <TabsTrigger value="email" id="tab-email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="next-n" aria-labelledby="tab-next-n">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstDayOffset != null}
                  className="rounded border-input transition-all duration-200"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFirstDayOffset(checked ? 1 : null);
                    if (checked) setDayInputStr("1");
                  }}
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
                    value={dayInputStr}
                    onChange={(e) => setDayInputStr(e.target.value)}
                    onBlur={() => {
                      const parsed = dayInputStr === "" ? 1 : Math.max(1, Math.min(365, Number(dayInputStr) || 1));
                      setFirstDayOffset(parsed);
                      setDayInputStr(String(parsed));
                    }}
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 transition-colors duration-200"
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

          <TabsContent value="email" aria-labelledby="tab-email">
            <MonthlyEmailPrefs
              challengeStart={challengeStart}
              challengeLength={challengeLength}
              basePence={basePence}
              switchDay={hasSwitch ? effectiveSwitchDay : null}
              switchBasePence={hasSwitch ? switchBasePence : null}
            />
          </TabsContent>
        </Tabs>

        {tab !== "email" && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBreakdown}
              onChange={(e) => setShowBreakdown(e.target.checked)}
              className="rounded border-input transition-all duration-200"
              aria-label="Show daily breakdown"
            />
            <span className="text-sm">Show daily breakdown</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPenceOnly}
              onChange={(e) => setShowPenceOnly(e.target.checked)}
              className="rounded border-input transition-all duration-200"
              aria-label="Show amounts in pence only"
            />
            <span className="text-sm">Pence only</span>
          </label>
        </div>
        )}

        {tab !== "email" && (result ? (
          <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 space-y-3 transition-colors duration-200">
            {showPenceOnly ? (
              <p className="text-3xl font-bold tabular-nums text-primary" aria-live="polite">
                {result.totalPence}p
              </p>
            ) : (
              <SlidingNumber
                value={result.totalPence / 100}
                decimals={2}
                prefix="£"
                className="text-3xl font-bold text-primary"
              />
            )}
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
                switchDay={hasSwitch ? effectiveSwitchDay : null}
                switchBasePence={hasSwitch ? switchBasePence : null}
                showPenceOnly={showPenceOnly}
                className="animate-fade-in"
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Select a range within your challenge period to see the total.
          </p>
        ))}

        {tab !== "email" && formulaExplanation && (
          <Accordion type="single" collapsible>
            <AccordionItem value="formula">
              <AccordionTrigger>How is this calculated?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm font-mono text-muted-foreground">{formulaExplanation}</p>
                <p className="text-sm mt-2">
                  {hasSwitch && effectiveSwitchDay != null
                    ? `On Day ${effectiveSwitchDay} (${switchDate}), the rate changed from ${basePence}p/day to ${switchBasePence}p/day. Days prior are calculated at ${basePence}p/day and days from Day ${effectiveSwitchDay} onwards are calculated at ${switchBasePence}p/day.`
                    : basePence > 1
                    ? `At a ${basePence}x scale (+${basePence}p more each day), day k = ${basePence}×k pence (Day 1 = ${formatPenceAsGBP(basePence)}, Day 2 = ${formatPenceAsGBP(basePence * 2)}, etc.). The standard arithmetic series sum is scaled by ${basePence}p.`
                    : "The penny challenge uses an arithmetic series: day k = k pence (+1p each day). The sum from day a to day b is (b×(b+1) − (a−1)×a) ÷ 2 pence."}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 relative z-10">
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
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors duration-200"
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
    basePence?: number;
    switchDay?: number | null;
    switchBasePence?: number | null;
  }
): string {
  const fmt = (p: number) => opts.showPenceOnly ? `${p}p` : formatPenceAsGBP(p);
  let scaleSuffix = "";
  if (opts.switchDay != null && opts.switchBasePence != null) {
    if (r.lastDay < opts.switchDay) {
      scaleSuffix = ` (at ${opts.basePence ?? 1}p/day)`;
    } else if (r.firstDay >= opts.switchDay) {
      scaleSuffix = ` (at ${opts.switchBasePence}p/day)`;
    } else {
      scaleSuffix = ` (swapped to ${opts.switchBasePence}p/day on day ${opts.switchDay})`;
    }
  } else if (opts.basePence && opts.basePence > 1) {
    scaleSuffix = ` (at ${opts.basePence}p/day)`;
  }

  if (mode === "month" && opts.month != null && opts.year != null) {
    const monthName = format(new Date(opts.year, opts.month - 1), "MMMM yyyy");
    return `For ${monthName} (days ${r.firstDay}–${r.lastDay}), you'll deposit ${fmt(r.totalPence)}${scaleSuffix}.`;
  }
  if (mode === "next-n") {
    if (opts.firstDayOffset != null) {
      return `For the next ${opts.n} days starting from day ${opts.firstDayOffset}, you'll deposit ${fmt(r.totalPence)}${scaleSuffix}.`;
    }
    return `For the next ${opts.n} days starting ${opts.fromDate}, you'll deposit ${fmt(r.totalPence)}${scaleSuffix}.`;
  }
  if (mode === "custom" && opts.customStart && opts.customEnd) {
    return `From ${opts.customStart} to ${opts.customEnd} (${r.dayCount} days): ${fmt(r.totalPence)}${scaleSuffix}.`;
  }
  return `Total for ${r.dayCount} days: ${fmt(r.totalPence)}${scaleSuffix}.`;
}
