import { PrismaClient } from "./generated/client";

function createClient() {
  return new PrismaClient();
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient & ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
