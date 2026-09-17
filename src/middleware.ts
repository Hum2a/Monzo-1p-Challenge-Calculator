import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth(() => {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob:",
      "font-src 'self' https:",
      // data:/blob: needed for WebGL/shader effects (e.g. GPU post-process)
      "connect-src 'self' https: data: blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'self' https://humza-butt.onrender.com https://www.humza-butt.onrender.com",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  return response;
});
