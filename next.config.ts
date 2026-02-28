import type { NextConfig } from "next";
import path from "node:path";

const ogStub = path.resolve(process.cwd(), "scripts/og-stub.mjs");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Security headers applied to all responses (not in middleware so they run even when auth redirects)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob:",
              "font-src 'self' https:",
              "connect-src 'self' https:",
              "frame-ancestors 'self' https://humza-butt.onrender.com https://www.humza-butt.onrender.com http://localhost:3000 http://127.0.0.1:3000",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  // Exclude @vercel/og (~2.1 MB) to stay under Cloudflare Workers 3 MiB free tier limit
  turbopack: {
    resolveAlias: {
      "next/dist/compiled/@vercel/og/index.node.js": ogStub,
      "next/dist/compiled/@vercel/og/index.edge.js": ogStub,
    },
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/dist/compiled/@vercel/og/index.node.js": ogStub,
      "next/dist/compiled/@vercel/og/index.edge.js": ogStub,
    };
    return config;
  },
};

export default nextConfig;
