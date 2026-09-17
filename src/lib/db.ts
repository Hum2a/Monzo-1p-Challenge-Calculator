/**
 * Prisma client for Neon PostgreSQL.
 * Uses the Neon serverless driver adapter so auth works on Cloudflare Workers
 * (plain Prisma TCP sockets are not available in the Workers runtime).
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Cloudflare Workers / edge: use the runtime WebSocket implementation
if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

function createPrismaClient(): PrismaClient {
  if (typeof window !== "undefined") {
    throw new Error("PrismaClient must not be used in the browser");
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const db = globalThis.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
