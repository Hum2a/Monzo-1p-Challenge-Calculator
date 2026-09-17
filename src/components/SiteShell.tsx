"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/react-bits/aurora-background";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: React.ReactNode;
  /** Compact header without large brand block */
  compact?: boolean;
  className?: string;
};

const navEase = [0.22, 1, 0.36, 1] as const;

export function SiteShell({ children, compact = false, className }: SiteShellProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("min-h-screen flex flex-col relative", className)}>
      <AuroraBackground />

      <motion.header
        className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur-md"
        initial={reduce ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: navEase }}
      >
        <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="1p Challenge Calculator home"
          >
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Image
                src="/Monzo-Emblem-Light.png"
                alt="Monzo"
                width={44}
                height={44}
                priority
                className="drop-shadow-sm"
              />
            </motion.div>
            <div>
              <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                1p Challenge Calculator
              </p>
              {!compact && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Plan your penny accumulator savings
                </p>
              )}
            </div>
          </Link>

          <nav className="flex items-center gap-2 flex-wrap" aria-label="Main">
            <AuthButton />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <a
                href="https://github.com/Hum2a/Monzo-1p-Challenge-Calculator"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
          </nav>
        </div>
      </motion.header>

      <main className="flex-1 relative z-10">{children}</main>

      <motion.footer
        className="border-t border-border/60 py-8 mt-auto relative z-10 bg-card/40 backdrop-blur-sm"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/Monzo_logo.png"
              alt="Monzo"
              width={72}
              height={16}
              className="opacity-70"
            />
            <span className="text-xs">inspired</span>
          </div>
          <p>
            This is not financial advice. Always do your own research before
            saving or investing.
          </p>
          <p>Your data stays in your browser. No account required.</p>
        </div>
      </motion.footer>
    </div>
  );
}
