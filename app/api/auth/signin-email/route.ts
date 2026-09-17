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

    await signIn("resend", {
      email: email.trim().toLowerCase(),
      redirectTo: "/",
    });

    // signIn redirects internally; if we reach here, redirect to verify
    return NextResponse.redirect(new URL("/auth/verify", req.url));
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("[signin-email] AuthError:", error.type, error.message);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.type)}`, req.url)
      );
    }
    // Rethrow redirects (Next.js redirect() throws)
    throw error;
  }
}
