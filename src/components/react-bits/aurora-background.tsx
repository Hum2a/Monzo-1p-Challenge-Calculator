"use client";

import { cn } from "@/lib/utils";

/** React Bits–inspired soft aurora / grid atmosphere (Monzo navy + coral). */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-3xl motion-safe:animate-aurora"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(254,75,96,0.35) 0%, rgba(0,122,139,0.18) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-[320px] w-[480px] translate-x-1/4 translate-y-1/4 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,30,58,0.45) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(var(--monzo-navy) 1px, transparent 1px), linear-gradient(90deg, var(--monzo-navy) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
    </div>
  );
}
