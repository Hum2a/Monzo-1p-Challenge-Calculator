#!/usr/bin/env node
/**
 * Deploy to production using vars from .dev.vars.production.
 * Run: npm run deploy:prod
 *
 * Loads .dev.vars.production, uploads secrets to Cloudflare, then builds and deploys.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const varsPath = join(root, ".dev.vars.production");
const skipSecrets = process.argv.includes("--no-secrets");

if (!existsSync(varsPath)) {
  console.error("Missing .dev.vars.production");
  console.error("Copy .dev.vars.production.example to .dev.vars.production and fill in your production values.");
  process.exit(1);
}

const content = readFileSync(varsPath, "utf8");
const env = { ...process.env };
const secrets = {};

for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
  secrets[key] = value;
}

console.log("Loaded production vars from .dev.vars.production");

console.log("Running build + deploy...\n");

execSync("npx opennextjs-cloudflare build && node scripts/replace-og-for-cf.mjs && npx opennextjs-cloudflare deploy", {
  stdio: "inherit",
  env,
  cwd: root,
});

if (!skipSecrets) {
  console.log("\nUploading secrets to Cloudflare...");
  const isWin = process.platform === "win32";
  for (const [key, value] of Object.entries(secrets)) {
    const tempPath = join(tmpdir(), `wrangler-secret-${key}-${Date.now()}`);
    try {
      writeFileSync(tempPath, value, "utf8");
      const quotedPath = `"${tempPath.replace(/"/g, '\\"')}"`;
      const pipeCmd = isWin
        ? `type ${quotedPath} | npx wrangler secret put ${key}`
        : `cat ${quotedPath} | npx wrangler secret put ${key}`;
      try {
        execSync(pipeCmd, { shell: true, env, cwd: root, stdio: "inherit" });
      } catch (err) {
        console.error(`\nFailed to upload secret ${key}. Tip: Run manually: echo YOUR_VALUE | npx wrangler secret put ${key}`);
        process.exit(1);
      }
    } finally {
      try {
        unlinkSync(tempPath);
      } catch (_) {}
    }
  }
  console.log("Secrets uploaded.");
}
