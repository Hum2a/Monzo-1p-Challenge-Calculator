/**
 * Prisma client for Neon PostgreSQL.
 * Uses DATABASE_URL from env. Required for auth and saved states.
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (typeof window !== "undefined") {
    throw new Error("PrismaClient must not be used in the browser");
  }
  return new PrismaClient();
}

export const db = globalThis.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
