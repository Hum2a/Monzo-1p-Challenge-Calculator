/**
 * GET /api/health/db — verifies DATABASE_URL + Prisma Neon HTTP adapter.
 * No secrets returned. Useful after Cloudflare deploys.
 */
import { NextResponse } from "next/server";
import { cleanDatabaseUrl, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = Boolean(process.env.DATABASE_URL);
  try {
    if (!hasUrl) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL missing" },
        { status: 503 }
      );
    }

    const cleaned = cleanDatabaseUrl(process.env.DATABASE_URL!);
    const db = getDb();
    const users = await db.user.count();

    return NextResponse.json({
      ok: true,
      users,
      pooler: cleaned.includes("-pooler."),
      channelBinding: cleaned.includes("channel_binding"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[health/db]", message);
    return NextResponse.json(
      { ok: false, error: message.slice(0, 200) },
      { status: 503 }
    );
  }
}
