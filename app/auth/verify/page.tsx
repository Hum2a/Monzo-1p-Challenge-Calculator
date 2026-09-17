import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <SiteShell compact>
      <div className="flex items-center justify-center px-4 py-16">
        <FadeIn className="text-center space-y-6 max-w-md">
          <Image
            src="/Monzo-Emblem-Light.png"
            alt="Monzo"
            width={56}
            height={56}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent you a magic link. Click it to sign in to your
            account.
          </p>
          <Button asChild>
            <Link href="/">Back to calculator</Link>
          </Button>
        </FadeIn>
      </div>
    </SiteShell>
  );
}
