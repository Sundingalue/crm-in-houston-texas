import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const fallbackUrl = "postgresql://user:password@localhost:5432/postgres";
const databaseUrl = process.env.DATABASE_URL?.startsWith("postgres") ? process.env.DATABASE_URL : fallbackUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: databaseUrl } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
