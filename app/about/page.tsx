import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About the 1p Challenge",
  description:
    "Learn how the 1p Accumulator / Penny Challenge savings plan works.",
};

export default function AboutPage() {
  return (
    <SiteShell compact>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <FadeIn>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            About the 1p Challenge
          </h1>
          <p className="text-muted-foreground mb-8">
            A simple arithmetic savings plan — and how this calculator helps you
            transfer the right amount into Monzo each month.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              The 1p Challenge (also called the Penny Challenge or 1p
              Accumulator) is a popular savings plan where you save a small
              amount each day, increasing by 1p daily.
            </p>
            <p>
              <strong className="text-foreground">How it works:</strong> On Day
              1 you save 1p. On Day 2 you save 2p. On Day 3 you save 3p, and so
              on. By the end of 364 days, you&apos;ll have saved over £660.
            </p>
            <p>
              The total comes from a simple arithmetic series: 1 + 2 + 3 + … +
              364 = 66,430 pence (£664.30). A 365-day version saves £667.95.
            </p>
            <p>
              <strong className="text-foreground">Flexibility:</strong> Many
              people adapt the challenge to fit their schedule. You can start on
              any date, choose 364 or 365 days, and use this calculator to plan
              how much to deposit for a specific month or date range.
            </p>
            <p>
              This calculator helps you figure out exactly how much to put aside
              for the next 30 days, for a given month, or for any custom range —
              so you can budget with confidence.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10">
            <Button asChild>
              <Link href="/#calculator">Try the calculator</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </SiteShell>
  );
}
