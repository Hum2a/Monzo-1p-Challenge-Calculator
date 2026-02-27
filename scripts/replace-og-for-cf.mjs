#!/usr/bin/env node
/**
 * Replaces @vercel/og with a minimal stub before Cloudflare deploy.
 * Saves ~2.1 MB (resvg.wasm + index.edge.js) to stay under Workers 3 MiB free tier limit.
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const ogDir = join(root, "node_modules", "next", "dist", "compiled", "@vercel", "og");
const stubPath = join(root, "scripts", "og-stub.mjs");
const targetPath = join(ogDir, "index.edge.js");

if (!existsSync(ogDir)) {
  console.warn("replace-og: @vercel/og not found, skipping");
  process.exit(0);
}

if (!existsSync(stubPath)) {
  console.error("replace-og: stub not found at", stubPath);
  process.exit(1);
}

copyFileSync(stubPath, targetPath);
console.log("replace-og: Replaced @vercel/og with stub for Cloudflare deploy");
