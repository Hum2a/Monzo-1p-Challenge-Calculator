/**
 * Prisma + Neon for Cloudflare Workers / OpenNext.
 * Per-request client (no global pool reuse) + HTTP adapter (fetch, not TCP/WebSocket).
 * @see https://opennext.js.org/cloudflare/howtos/db
 */

import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

/** Strip quotes / channel_binding — both break Neon serverless on Workers. */
export function cleanDatabaseUrl(url: string): string {
  const trimmed = url.trim().replace(/^['"]|['"]$/g, "");
  try {
    const parsed = new URL(trimmed);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

function createPrismaClient(): PrismaClient {
  if (typeof window !== "undefined") {
    throw new Error("PrismaClient must not be used in the browser");
  }

  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionString = cleanDatabaseUrl(raw);
  const adapter = new PrismaNeonHTTP(connectionString, {
    arrayMode: false,
    fullResults: true,
  });

  return new PrismaClient({ adapter });
}

/** Prefer this in Server Components / Route Handlers. Cached per React request. */
export const getDb = cache(() => createPrismaClient());

/**
 * Sync proxy for Auth.js PrismaAdapter and existing `db` imports.
 * Resolves to a per-request client via React `cache()`.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getDb();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
