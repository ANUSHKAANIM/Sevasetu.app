import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// `max: 1` serializes all queries onto a single connection. This is a
// workaround specifically for `prisma dev`'s lightweight local Postgres
// server, which reliably drops connections under concurrent queries (e.g.
// dashboard pages firing several `prisma.*.count()` calls via
// `Promise.all`). A real Postgres deployment (RDS, Prisma Postgres cloud,
// etc.) handles concurrent connections fine and would not need this cap.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: 1,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
