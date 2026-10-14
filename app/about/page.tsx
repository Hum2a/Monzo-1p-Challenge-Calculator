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
              <strong className="text-foreground">Scaling up to 4p more each day:</strong>{" "}
              Monzo now lets customers on paid tiers (such as Monzo Extra, Perks, and Max)
              scale their challenge with multipliers up to 4x (+4p/day):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>1x (Standard · +1p/day):</strong> Day 1 = 1p, Day 365 = £3.65 → <strong>£667.95</strong> total
              </li>
              <li>
                <strong>2x (Double · +2p/day):</strong> Day 1 = 2p, Day 365 = £7.30 → <strong>£1,335.90</strong> total
              </li>
              <li>
                <strong>3x (Triple · +3p/day):</strong> Day 1 = 3p, Day 365 = £10.95 → <strong>£2,003.85</strong> total
              </li>
              <li>
                <strong>4x (Monzo Max · +4p/day):</strong> Day 1 = 4p, Day 365 = £14.60 → <strong>£2,671.80</strong> total
              </li>
            </ul>
            <p>
              <strong className="text-foreground">Swapping rates mid-challenge:</strong>{" "}
              If you upgrade your Monzo plan or switch your multiplier halfway through the year
              (e.g. from 1p/day to 4p/day on Day 90), you can select that exact day or date.
              The calculator accounts for your initial rate up to the swap date and scales your daily deposits
              at the new rate from then on.
            </p>
            <p>
              <strong className="text-foreground">Flexibility:</strong> Many
              people adapt the challenge to fit their schedule. You can start on
              any date, choose 364 or 365 days, select your preferred daily scale (1x–4x),
              swap rates mid-year if your savings goal changes,
              and use this calculator to plan how much to deposit for a specific month or date range.
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
