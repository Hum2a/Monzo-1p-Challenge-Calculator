import type { NextConfig } from "next";
import path from "node:path";

const ogStub = path.resolve(process.cwd(), "scripts/og-stub.mjs");

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
