import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/magicui/border-beam";

export default function SignInPage() {
  return (
    <SiteShell compact>
      <div className="flex items-center justify-center px-4 py-12">
        <FadeIn className="w-full max-w-md">
          <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm shadow-lg">
            <BorderBeam duration={12} />
            <CardHeader className="text-center relative z-10">
              <div className="flex justify-center mb-2">
                <Image
                  src="/Monzo-Emblem-Light.png"
                  alt="Monzo"
                  width={48}
                  height={48}
                />
              </div>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Enter your email to receive a magic link. No password needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <form
                action="/api/auth/signin-email"
                method="POST"
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
        </FadeIn>
      </div>
    </SiteShell>
  );
}
