/**
 * GET/PATCH /api/account/email-prefs — monthly transfer email settings.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { emailPrefsSchema } from "@/lib/validation";

function rateLimited() {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": "60" } }
  );
}

export async function GET(request: Request) {
  const { ok } = rateLimit(request);
  if (!ok) return rateLimited();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        monthlyEmailEnabled: true,
        challengeStart: true,
        challengeLength: true,
        basePence: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      monthlyEmailEnabled: user.monthlyEmailEnabled,
      challengeStart: user.challengeStart,
      challengeLength: user.challengeLength === 365 ? 365 : 364,
      basePence: user.basePence,
    });
  } catch (err) {
    console.error("[email-prefs] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { ok } = rateLimit(request);
  if (!ok) return rateLimited();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = emailPrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { monthlyEmailEnabled, challengeStart, challengeLength, basePence } =
      parsed.data;

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        monthlyEmailEnabled,
        challengeStart: challengeStart === undefined ? undefined : challengeStart,
        challengeLength,
        basePence,
      },
      select: {
        monthlyEmailEnabled: true,
        challengeStart: true,
        challengeLength: true,
        basePence: true,
      },
    });

    return NextResponse.json({
      monthlyEmailEnabled: updated.monthlyEmailEnabled,
      challengeStart: updated.challengeStart,
      challengeLength: updated.challengeLength === 365 ? 365 : 364,
      basePence: updated.basePence,
    });
  } catch (err) {
    console.error("[email-prefs] PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
