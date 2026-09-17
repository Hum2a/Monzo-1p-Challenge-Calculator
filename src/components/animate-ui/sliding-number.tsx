"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

type SlidingNumberProps = {
  value: number;
  decimals?: number;
  className?: string;
  prefix?: string;
};

/** Animate UI–style sliding number (Motion). */
export function SlidingNumber({
  value,
  decimals = 2,
  className,
  prefix = "",
}: SlidingNumberProps) {
  const spring = useSpring(value, { stiffness: 120, damping: 24, mass: 0.6 });
  const display = useTransform(spring, (v) => {
    const fixed = v.toFixed(decimals);
    return `${prefix}${fixed}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span
      className={cn("tabular-nums inline-block", className)}
      aria-live="polite"
    >
      <MotionText value={display} />
    </motion.span>
  );
}

function MotionText({ value }: { value: MotionValue<string> }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const unsub = value.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    if (ref.current) ref.current.textContent = value.get();
    return unsub;
  }, [value]);
  return <span ref={ref} />;
}
