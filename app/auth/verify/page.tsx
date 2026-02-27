import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent you a magic link. Click it to sign in to your account.
        </p>
        <Button asChild>
          <Link href="/">Back to calculator</Link>
        </Button>
      </div>
    </div>
  );
}
