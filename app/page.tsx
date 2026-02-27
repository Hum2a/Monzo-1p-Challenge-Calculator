import Link from "next/link";
import { Calculator } from "@/components/Calculator";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative z-10">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">1p</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">1p Challenge Calculator</h1>
              <p className="text-sm text-muted-foreground">
                Plan your penny accumulator savings
              </p>
            </div>
          </div>
          <nav className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <Calculator />
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-1">
          <p>
            This is not financial advice. Always do your own research before saving or investing.
          </p>
          <p>Your data stays in your browser. No account required.</p>
        </div>
      </footer>
    </div>
  );
}
