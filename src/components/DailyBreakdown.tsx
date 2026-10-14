"use client";

import * as React from "react";
import {
  getDailyAmounts,
  formatPenceAsGBP,
} from "@/lib/pennyChallenge";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_HEIGHT = 280;

interface DailyBreakdownProps {
  firstDay: number;
  lastDay: number;
  basePence?: number;
  switchDay?: number | null;
  switchBasePence?: number | null;
  showPenceOnly?: boolean;
  className?: string;
}

export function DailyBreakdown({
  firstDay,
  lastDay,
  basePence = 1,
  switchDay,
  switchBasePence,
  showPenceOnly = false,
  className,
}: DailyBreakdownProps) {
  const rows = React.useMemo(
    () => getDailyAmounts(firstDay, lastDay, basePence, switchDay, switchBasePence),
    [firstDay, lastDay, basePence, switchDay, switchBasePence]
  );

  return (
    <div
      className={cn(
        "overflow-y-auto rounded-md border border-border bg-muted/30 transition-colors duration-200",
        className
      )}
      style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
      role="region"
      aria-label="Daily amount breakdown"
    >
      {rows.map(({ day, pence, isSwitchDay }) => (
        <div
          key={day}
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm even:bg-muted/50 transition-colors",
            isSwitchDay && "bg-primary/10 border-l-2 border-primary font-medium"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Day {day}</span>
            {isSwitchDay && (
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/15 px-1.5 py-0.5 rounded">
                Switched to {switchBasePence}p/day
              </span>
            )}
          </div>
          <span className="font-medium tabular-nums">
            {showPenceOnly ? `${pence}p` : formatPenceAsGBP(pence)}
          </span>
        </div>
      ))}
    </div>
  );
}
