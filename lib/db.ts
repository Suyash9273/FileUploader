// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

// NOTE: This is a workaround for a known issue in Prisma 7.2.0
// Remove this when the issue is fixed
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "error"], // optional but VALID options
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export default prisma;
