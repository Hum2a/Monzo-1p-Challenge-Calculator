"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
};

/** Magic UI–style border beam accent for interactive cards. */
export function BorderBeam({
  className,
  size = 200,
  duration = 8,
  colorFrom = "#FE4B60",
  colorTo = "#007A8B",
}: BorderBeamProps) {
  const style = {
    background: `conic-gradient(from var(--beam-angle, 0deg), transparent 0%, ${colorFrom} 10%, ${colorTo} 20%, transparent 30%)`,
    "--beam-size": `${size}px`,
    "--beam-duration": `${duration}s`,
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
    padding: "1px",
  } as CSSProperties;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className="absolute inset-[-1px] rounded-[inherit] opacity-70 motion-safe:animate-border-beam"
        style={style}
      />
    </div>
  );
}
