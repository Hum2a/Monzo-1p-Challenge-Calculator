/**
 * GET /api/saved - List saved states for authenticated user.
 * POST not used - use /api/save for creating.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { ok } = rateLimit(request);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const states = await db.savedState.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, state: true, updatedAt: true },
    });

    return NextResponse.json({ states });
  } catch (err) {
    console.error("[saved] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
