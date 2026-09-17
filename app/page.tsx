import Link from "next/link";
import { Calculator } from "@/components/Calculator";
import { SiteShell } from "@/components/SiteShell";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <SiteShell>
      <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-4 max-w-lg">
        <FadeIn>
          <section className="mb-8 text-center sm:text-left" aria-labelledby="hero-heading">
            <p className="text-sm font-medium text-primary mb-2 tracking-wide">
              Monzo · 1p Accumulator
            </p>
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance"
            >
              Know exactly how much to put aside
            </h1>
            <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-md mx-auto sm:mx-0">
              Calculate your daily deposits for any month, stretch of days, or
              custom range — then transfer into Monzo with confidence.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button asChild>
                <a href="#calculator">Open calculator</a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">How it works</Link>
              </Button>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div id="calculator" className="scroll-mt-24">
            <Calculator />
          </div>
        </FadeIn>
      </div>
    </SiteShell>
  );
}
