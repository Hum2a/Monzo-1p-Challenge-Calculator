/**
 * POST /api/auth/signin-email
 * Accepts email and triggers magic link via Auth.js Resend provider.
 * Uses a Route Handler instead of Server Actions for Cloudflare Workers compatibility.
 */
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.AUTH_RESEND_KEY) {
      console.error("[signin-email] AUTH_RESEND_KEY is missing");
      return NextResponse.redirect(
        new URL("/auth/error?error=Configuration", req.url)
      );
    }

    const formData = await req.formData();
    const email = formData.get("email") as string | null;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=InvalidEmail", req.url)
      );
    }

    const result = await signIn("resend", {
      email: email.trim().toLowerCase(),
      redirectTo: "/",
      redirect: false,
    });

    const location =
      typeof result === "string" ? result : "/auth/verify";
    const errorCode = errorCodeFromAuthUrl(location);
    if (errorCode) {
      console.error("[signin-email] Auth returned error:", errorCode);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(errorCode)}`, req.url)
      );
    }

    return NextResponse.redirect(new URL("/auth/verify", req.url));
  } catch (error) {
    if (error instanceof AuthError) {
      console.error(
        "[signin-email] AuthError:",
        error.type,
        error.cause ?? error.message
      );
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(publicAuthError(error.type))}`,
          req.url
        )
      );
    }
    // Rethrow redirects (Next.js / Auth.js redirect() throws)
    throw error;
  }
}

function errorCodeFromAuthUrl(location: string): string | null {
  try {
    const url = new URL(location, "https://monzo-1p-challenge-calculator.online");
    const error = url.searchParams.get("error");
    if (!error) return null;
    return publicAuthError(error);
  } catch {
    return null;
  }
}

/** Auth.js maps many server errors to "Configuration"; email-send failures are EmailSignin. */
function publicAuthError(type: string): string {
  if (
    type === "EmailSignInError" ||
    type === "EmailSignin" ||
    type === "EmailSend"
  ) {
    return "EmailSignin";
  }
  return type;
}
