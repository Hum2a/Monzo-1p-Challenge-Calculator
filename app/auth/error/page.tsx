import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

const ERROR_COPY: Record<string, string> = {
  Verification:
    "The sign-in link may have expired or already been used. Please request a new one.",
  EmailSignin:
    "We couldn't send the magic link. Check that Resend is configured (API key + verified domain for the From address) and try again.",
  EmailSignInError:
    "We couldn't send the magic link. Check that Resend is configured (API key + verified domain for the From address) and try again.",
  Configuration:
    "Auth isn't configured correctly on the server (AUTH_SECRET, AUTH_URL, AUTH_RESEND_KEY, or database). Check Cloudflare secrets.",
  AdapterError:
    "Could not reach the database. The app needs the Neon serverless Prisma adapter on Cloudflare Workers — redeploy after the fix, and confirm DATABASE_URL is set.",
  AccessDenied: "Sign-in was denied for this account.",
  OAuthSignin: "Could not start sign-in. Please try again.",
  OAuthCallback: "Sign-in callback failed. Please try again.",
  Callback: "Sign-in callback failed. Please try again.",
  Default: "We couldn't sign you in. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ?? "Default";
  const message = ERROR_COPY[error] ?? ERROR_COPY.Default;

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
          <p className="text-muted-foreground">{message}</p>
          {error !== "Default" && (
            <p className="text-xs text-muted-foreground font-mono">
              Error code: {error}
            </p>
          )}
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
