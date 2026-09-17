/**
 * POST /api/cron/monthly-transfer
 * Secured by CRON_SECRET. Sends monthly Monzo transfer amounts via Resend.
 */

import { NextResponse } from "next/server";
import { runMonthlyTransferEmails } from "@/lib/monthlyTransferEmail";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/monthly-transfer] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Cron not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== secret) {
    return unauthorized();
  }

  try {
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    const result = await runMonthlyTransferEmails(month, year);

    return NextResponse.json({
      month,
      year,
      ...result,
    });
  } catch (err) {
    console.error("[cron/monthly-transfer] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
