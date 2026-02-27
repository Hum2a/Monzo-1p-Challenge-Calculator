import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link. No password needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await signIn("resend", { email: formData.get("email") as string, redirectTo: "/" });
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <Input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="mt-1"
              />
            </label>
            <Button type="submit" className="w-full">
              Send magic link
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              ← Back to calculator
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
