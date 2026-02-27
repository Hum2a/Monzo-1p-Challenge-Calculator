"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled>
        ...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
          {session.user.email}
        </span>
        <form action={async () => await signOut({ callbackUrl: "/" })}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/auth/signin">Sign in to save</Link>
    </Button>
  );
}
