import { PrismaClient } from "@prisma/client";
import { getServerEnv, isProduction } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function isDatabaseConfigured() {
  return Boolean(getServerEnv().DATABASE_URL);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getServerEnv().NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (!isProduction()) {
  globalForPrisma.prisma = prisma;
}

export function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required for persistent marketplace data.");
  }
}
