/**
 * Auth.js v5 configuration - Magic link (email) auth with Resend.
 * Uses Prisma adapter for session/token storage in Neon PostgreSQL.
 */

import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/magicLinkEmail";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Resend({
      from:
        process.env.AUTH_RESEND_FROM ??
        "1p Challenge <noreply@monzo-1p-challenge-calculator.online>",
      apiKey: process.env.AUTH_RESEND_KEY,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const apiKey = provider.apiKey;
        const from = provider.from;
        if (!apiKey || !from) {
          throw new Error("Resend is not configured");
        }
        await sendMagicLinkEmail({ to: identifier, url, from, apiKey });
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
});
