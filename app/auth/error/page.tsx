import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ?? "Unknown error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
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
      </div>
    </div>
  );
}
