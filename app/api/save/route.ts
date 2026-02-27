/**
 * POST /api/save - Save calculator state for authenticated user.
 * Rate limited, validated with Zod.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { savedStateSchema } from "@/lib/validation";

const MAX_NAME_LENGTH = 100;
const MAX_STATES_PER_USER = 10;

export async function POST(request: Request) {
  const { ok, remaining } = rateLimit(request);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = savedStateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, state } = parsed.data;

    if (name && name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }

    const count = await db.savedState.count({ where: { userId: session.user.id } });
    if (count >= MAX_STATES_PER_USER) {
      return NextResponse.json(
        { error: "Maximum saved states reached (10)" },
        { status: 429 }
      );
    }

    const saved = await db.savedState.upsert({
      where: {
        userId_name: { userId: session.user.id, name: name ?? "Default" },
      },
      create: { userId: session.user.id, name: name ?? "Default", state },
      update: { state, updatedAt: new Date() },
    });

    return NextResponse.json({ id: saved.id, name: saved.name });
  } catch (err) {
    console.error("[save] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
