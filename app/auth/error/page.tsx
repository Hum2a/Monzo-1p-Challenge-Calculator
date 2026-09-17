import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ?? "Unknown error";

  return (
    <SiteShell compact>
      <div className="flex items-center justify-center px-4 py-16">
        <FadeIn className="text-center space-y-6 max-w-md">
          <Image
            src="/Monzo-Emblem-Light.png"
            alt="Monzo"
            width={48}
            height={48}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            {error === "Verification"
              ? "The sign-in link may have expired. Please request a new one."
              : "We couldn't sign you in. Please try again."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/auth/signin">Try again</Link>
            </Button>
            <Button asChild>
              <Link href="/">Back to calculator</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </SiteShell>
  );
}
