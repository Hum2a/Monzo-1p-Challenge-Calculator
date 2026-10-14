"use client";

import * as React from "react";
import {
  getDailyAmounts,
  formatPenceAsGBP,
  getAllMonthsBreakdown,
  computeBudgetStats,
  generateBreakdownCSV,
  dateToDayNumber,
  type ChallengeConfig,
  type DailyAmountRow,
} from "@/lib/pennyChallenge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar,
  Search,
  Download,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

const MAX_VISIBLE_HEIGHT = 320;

type BreakdownTab = "daily" | "monthly" | "stats";

interface DailyBreakdownProps {
  firstDay: number;
  lastDay: number;
  basePence?: number;
  switchDay?: number | null;
  switchBasePence?: number | null;
  showPenceOnly?: boolean;
  className?: string;
  config?: ChallengeConfig;
  onSelectMonth?: (month: number, year: number) => void;
}

export function DailyBreakdown({
  firstDay,
  lastDay,
  basePence = 1,
  switchDay,
  switchBasePence,
  showPenceOnly = false,
  className,
  config,
  onSelectMonth,
}: DailyBreakdownProps) {
  const [activeTab, setActiveTab] = React.useState<BreakdownTab>("daily");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const switchRowRef = React.useRef<HTMLDivElement>(null);
  const todayRowRef = React.useRef<HTMLDivElement>(null);

  // Compute full config fallback if not passed
  const effectiveConfig: ChallengeConfig = React.useMemo(() => {
    return (
      config ?? {
        startDate: new Date(new Date().getFullYear(), 0, 1),
        challengeLengthDays: 365,
        basePence,
        switchDay,
        switchBasePence,
      }
    );
  }, [config, basePence, switchDay, switchBasePence]);

  const rows: DailyAmountRow[] = React.useMemo(
    () =>
      getDailyAmounts(
        firstDay,
        lastDay,
        basePence,
        switchDay,
        switchBasePence,
        effectiveConfig
      ),
    [firstDay, lastDay, basePence, switchDay, switchBasePence, effectiveConfig]
  );

  const monthsBreakdown = React.useMemo(
    () => getAllMonthsBreakdown(effectiveConfig),
    [effectiveConfig]
  );

  const budgetStats = React.useMemo(
    () => computeBudgetStats(firstDay, lastDay, effectiveConfig),
    [firstDay, lastDay, effectiveConfig]
  );

  const todayDayNumber = React.useMemo(() => {
    return dateToDayNumber(new Date(), effectiveConfig);
  }, [effectiveConfig]);

  const filteredRows = React.useMemo(() => {
    if (!searchFilter.trim()) return rows;
    const q = searchFilter.toLowerCase().trim();
    return rows.filter((r) => {
      const matchDay = `day ${r.day}`.includes(q) || String(r.day) === q;
      const matchDate = r.dateStr?.toLowerCase().includes(q) ?? false;
      const matchFormattedDate = r.date
        ? format(r.date, "d MMM").toLowerCase().includes(q)
        : false;
      return matchDay || matchDate || matchFormattedDate;
    });
  }, [rows, searchFilter]);

  const handleExportCSV = () => {
    const csv = generateBreakdownCSV(rows, effectiveConfig);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monzo-1p-challenge-days-${firstDay}-to-${lastDay}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const lines = rows.map((r) => {
      const datePart = r.date ? ` (${format(r.date, "d MMM yyyy")})` : "";
      const amtPart = showPenceOnly ? `${r.pence}p` : formatPenceAsGBP(r.pence);
      const ratePart = r.rate && r.rate > 1 ? ` [${r.rate}p/day]` : "";
      return `Day ${r.day}${datePart}: ${amtPart}${ratePart}`;
    });
    const header = `Monzo 1p Challenge Breakdown (Days ${firstDay}–${lastDay}): Total ${showPenceOnly ? `${budgetStats.totalPence}p` : formatPenceAsGBP(budgetStats.totalPence)}\n`;
    try {
      await navigator.clipboard.writeText(header + lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const scrollToRow = (targetRef: React.RefObject<HTMLDivElement | null>) => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const hasSwitchInRange =
    switchDay != null &&
    switchBasePence != null &&
    switchDay >= firstDay &&
    switchDay <= lastDay;

  const isTodayInRange =
    todayDayNumber != null &&
    todayDayNumber >= firstDay &&
    todayDayNumber <= lastDay;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-background/95 shadow-sm transition-all duration-200 overflow-hidden",
        className
      )}
      role="region"
      aria-label="Challenge Schedule Breakdown"
    >
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-2 py-1.5">
        <div
          role="tablist"
          aria-label="Breakdown views"
          className="flex items-center gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "daily"}
            onClick={() => setActiveTab("daily")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
              activeTab === "daily"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <CalendarDays className="size-3.5" />
            <span>Daily Schedule ({rows.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "monthly"}
            onClick={() => setActiveTab("monthly")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
              activeTab === "monthly"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Calendar className="size-3.5" />
            <span>12-Month Roadmap</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
              activeTab === "stats"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <BarChart3 className="size-3.5" />
            <span>Budget Stats</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopySummary}
            title="Copy breakdown list to clipboard"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-500" />
                <span className="hidden sm:inline text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export CSV spreadsheet"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
          >
            <Download className="size-3" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Schedule */}
      {activeTab === "daily" && (
        <div>
          {/* Quick filter & Jump toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-border/50 bg-muted/20 text-xs">
            <div className="relative flex-1 min-w-[140px] max-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter day or date..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs bg-background/80 border border-input rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              {isTodayInRange && (
                <button
                  type="button"
                  onClick={() => scrollToRow(todayRowRef)}
                  className="px-2 py-0.5 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors cursor-pointer"
                >
                  Jump to Today
                </button>
              )}
              {hasSwitchInRange && (
                <button
                  type="button"
                  onClick={() => scrollToRow(switchRowRef)}
                  className="px-2 py-0.5 text-[11px] font-medium text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded transition-colors cursor-pointer"
                >
                  Jump to Switch
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div
            ref={containerRef}
            className="overflow-y-auto divide-y divide-border/40 scroll-smooth"
            style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
          >
            {filteredRows.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No days match &ldquo;{searchFilter}&rdquo;
              </div>
            ) : (
              filteredRows.map((row) => {
                const isToday = row.day === todayDayNumber;
                const isSwitch = row.isSwitchDay;

                return (
                  <div
                    key={row.day}
                    ref={isSwitch ? switchRowRef : isToday ? todayRowRef : null}
                    className={cn(
                      "flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                      isSwitch
                        ? "bg-amber-500/10 border-l-3 border-amber-500 font-medium"
                        : isToday
                        ? "bg-primary/10 border-l-3 border-primary font-medium"
                        : "hover:bg-muted/40 even:bg-muted/15"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-foreground">
                        Day {row.day}
                      </span>
                      {row.date && (
                        <span className="text-[11px] text-muted-foreground">
                          • {format(row.date, "EEE, d MMM")}
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/20 px-1.5 py-0.5 rounded">
                          Today
                        </span>
                      )}
                      {isSwitch && (
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/15 px-1.5 py-0.5 rounded">
                          Switched to {switchBasePence}p/day
                        </span>
                      )}
                      {!isSwitch && row.rate && row.rate > 1 && (
                        <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                          {row.rate}x
                        </span>
                      )}
                    </div>

                    <span className="font-semibold tabular-nums text-foreground">
                      {showPenceOnly ? `${row.pence}p` : formatPenceAsGBP(row.pence)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 12-Month Roadmap */}
      {activeTab === "monthly" && (
        <div
          className="overflow-y-auto divide-y divide-border/40"
          style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
        >
          <div className="p-2.5 bg-muted/20 border-b border-border/50 text-xs text-muted-foreground">
            Complete month-by-month financial projection across the challenge.
            {onSelectMonth && (
              <span className="block mt-0.5 text-primary">
                Tip: Click any month to view and budget for that specific month.
              </span>
            )}
          </div>

          {monthsBreakdown.map((m) => {
            const isCurrentMonth =
              new Date().getMonth() + 1 === m.month &&
              new Date().getFullYear() === m.year;

            return (
              <div
                key={`${m.year}-${m.month}`}
                onClick={() => onSelectMonth?.(m.month, m.year)}
                className={cn(
                  "p-3 text-xs transition-colors group",
                  onSelectMonth ? "cursor-pointer hover:bg-muted/50" : "",
                  isCurrentMonth && "bg-primary/5 border-l-3 border-primary"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground">
                      {m.monthName} {m.year}
                    </span>
                    {isCurrentMonth && (
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/20 px-1 py-0.2 rounded">
                        Current
                      </span>
                    )}
                    {m.hasRateSwitch && (
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/15 px-1 py-0.2 rounded">
                        Rate Swapped
                      </span>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-1">
                    <span className="text-sm font-bold text-primary tabular-nums">
                      {showPenceOnly ? `${m.totalPence}p` : formatPenceAsGBP(m.totalPence)}
                    </span>
                    {onSelectMonth && (
                      <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground mt-2">
                  <div>
                    <span className="block text-[10px] text-muted-foreground/75">Challenge Days</span>
                    <span className="font-medium text-foreground">
                      Days {m.firstDay}–{m.lastDay} ({m.dayCount}d)
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground/75">Saved to Date</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {showPenceOnly ? `${m.cumulativePence}p` : formatPenceAsGBP(m.cumulativePence)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground/75">Peak Day</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {showPenceOnly ? `${m.peakDayPence}p` : formatPenceAsGBP(m.peakDayPence)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground/75">Share of Challenge</span>
                    <span className="font-medium text-foreground">
                      {m.percentOfAnnual.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar representing share of annual challenge */}
                <div className="w-full bg-muted rounded-full h-1 mt-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(3, m.percentOfAnnual * 3))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Budget Stats */}
      {activeTab === "stats" && (
        <div
          className="p-3 space-y-3 overflow-y-auto"
          style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                Daily Average
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {showPenceOnly ? `${budgetStats.avgDailyPence}p` : formatPenceAsGBP(budgetStats.avgDailyPence)}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                per day across {budgetStats.dayCount} days
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                Weekly Equivalent
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {showPenceOnly ? `${budgetStats.avgWeeklyPence}p` : formatPenceAsGBP(budgetStats.avgWeeklyPence)}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                avg weekly deposit commitment
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                Lowest Single Day
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {showPenceOnly ? `${budgetStats.lowestDayPence}p` : formatPenceAsGBP(budgetStats.lowestDayPence)}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Day {budgetStats.lowestDay}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                Peak Single Day
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {showPenceOnly ? `${budgetStats.peakDayPence}p` : formatPenceAsGBP(budgetStats.peakDayPence)}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Day {budgetStats.peakDay}
              </span>
            </div>
          </div>

          {budgetStats.hasRateSwitch && (
            <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                <TrendingUp className="size-3.5" />
                <span>Rate Switch Impact</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-muted-foreground block">Before Switch:</span>
                  <span className="font-semibold text-foreground">
                    {formatPenceAsGBP(budgetStats.preSwapPence ?? 0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Days {firstDay}–{(switchDay ?? 0) - 1} at {basePence}p/day
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">After Switch:</span>
                  <span className="font-semibold text-foreground">
                    {formatPenceAsGBP(budgetStats.postSwapPence ?? 0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Days {switchDay}–{lastDay} at {switchBasePence}p/day
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
