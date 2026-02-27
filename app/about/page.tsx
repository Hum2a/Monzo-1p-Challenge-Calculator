import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About the 1p Challenge",
  description: "Learn how the 1p Accumulator / Penny Challenge savings plan works.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative z-10">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">1p</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">1p Challenge Calculator</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Calculator</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">About the 1p Challenge</h2>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>
            The 1p Challenge (also called the Penny Challenge or 1p Accumulator) is a popular
            savings plan where you save a small amount each day, increasing by 1p daily.
          </p>
          <p>
            <strong>How it works:</strong> On Day 1 you save 1p. On Day 2 you save 2p. On Day 3
            you save 3p, and so on. By the end of 364 days, you&apos;ll have saved over £660.
          </p>
          <p>
            The total comes from a simple arithmetic series: 1 + 2 + 3 + … + 364 = 66,430
            pence (£664.30). A 365-day version saves £667.95.
          </p>
          <p>
            <strong>Flexibility:</strong> Many people adapt the challenge to fit their schedule.
            You can start on any date, choose 364 or 365 days, and use this calculator to plan
            how much to deposit for a specific month or date range.
          </p>
          <p>
            This calculator helps you figure out exactly how much to put aside for the next 30
            days, for a given month, or for any custom range—so you can budget with confidence.
          </p>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link href="/">Try the calculator</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
