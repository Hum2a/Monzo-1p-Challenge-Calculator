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
  showPenceOnly?: boolean;
  className?: string;
}

export function DailyBreakdown({
  firstDay,
  lastDay,
  basePence = 1,
  showPenceOnly = false,
  className,
}: DailyBreakdownProps) {
  const rows = React.useMemo(
    () => getDailyAmounts(firstDay, lastDay, basePence),
    [firstDay, lastDay, basePence]
  );

  return (
    <div
      className={cn(
        "overflow-y-auto rounded-md border border-border bg-muted/30",
        className
      )}
      style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
      role="region"
      aria-label="Daily amount breakdown"
    >
      {rows.map(({ day, pence }) => (
        <div
          key={day}
          className="flex items-center justify-between px-3 py-2 text-sm even:bg-muted/50"
        >
          <span className="text-muted-foreground">Day {day}</span>
          <span className="font-medium tabular-nums">
            {showPenceOnly ? `${pence}p` : formatPenceAsGBP(pence)}
          </span>
        </div>
      ))}
    </div>
  );
}
