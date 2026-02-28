import Image from "next/image";
import Link from "next/link";
import { Calculator } from "@/components/Calculator";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative z-10">
      <header className="border-b border-border bg-card animate-fade-in opacity-0">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <Image
              src="/Monzo-Emblem-Light.png"
              alt="Monzo"
              width={40}
              height={40}
              className="transition-transform duration-200 hover:scale-105"
              priority
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">1p Challenge Calculator</h1>
              <p className="text-sm text-muted-foreground">
                Plan your penny accumulator savings
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2 flex-wrap">
            <AuthButton />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href="https://github.com/Hum2a/Monzo-1p-Challenge-Calculator" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 animate-fade-in-up opacity-0 animation-delay-100">
        <Calculator />
      </main>

      <footer className="border-t border-border py-6 mt-auto animate-fade-in opacity-0 animation-delay-200">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Image src="/Monzo_logo.png" alt="Monzo" width={72} height={16} className="opacity-70" />
            <span className="text-xs">inspired</span>
          </div>
          <p>
            This is not financial advice. Always do your own research before saving or investing.
          </p>
          <p>Your data stays in your browser. No account required.</p>
        </div>
      </footer>
    </div>
  );
}
