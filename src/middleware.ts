import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth(() => {
  const response = NextResponse.next();
  // Security headers moved to next.config.ts headers() so they apply to all responses
  // (middleware headers can be skipped when auth() redirects)
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
});
