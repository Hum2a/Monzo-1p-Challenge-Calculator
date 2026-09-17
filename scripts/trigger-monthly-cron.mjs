#!/usr/bin/env node
/**
 * Manually trigger the monthly transfer email cron (local or production).
 *
 * Usage:
 *   npm run cron:trigger
 *   npm run cron:trigger -- https://your-app.workers.dev
 *
 * Reads CRON_SECRET (and optional AUTH_URL) from .env.local, .env, or .dev.vars.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = {
  ...loadEnvFile(join(root, ".env")),
  ...loadEnvFile(join(root, ".env.local")),
  ...loadEnvFile(join(root, ".dev.vars")),
  ...loadEnvFile(join(root, ".dev.vars.production")),
  ...process.env,
};

const baseArg = process.argv[2];
const baseUrl = (baseArg || env.AUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);
const secret = env.CRON_SECRET;

if (!secret) {
  console.error("Missing CRON_SECRET. Set it in .env.local or .dev.vars.production.");
  process.exit(1);
}

const url = `${baseUrl}/api/cron/monthly-transfer`;
console.log(`POST ${url}`);

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  },
});

const text = await res.text();
let body = text;
try {
  body = JSON.stringify(JSON.parse(text), null, 2);
} catch {
  // keep raw
}

if (!res.ok) {
  console.error(`Failed (${res.status}):\n${body}`);
  process.exit(1);
}

console.log(`OK (${res.status}):\n${body}`);
