import { PrismaClient } from "@prisma/client";

/**
 * Singleton pattern for PrismaClient to avoid exhausting database connections.
 * Handles hot reloads in development and ensures only one instance in production.
 */

// Extend Node.js global type to persist PrismaClient in dev mode
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const client = global.prisma ?? createPrismaClient();

// Prevent multiple instances during hot-reloading in development
if (process.env.NODE_ENV !== "production") {
  global.prisma = client;
}

const db = client;
export default db;
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;