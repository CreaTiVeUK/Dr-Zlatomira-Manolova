import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Prisma 7 no longer reads the connection string from schema.prisma at
// runtime — the driver adapter is the only connection path. Pooled
// (pgbouncer) URL here matches the old datasource.url; migrations use the
// direct URL via prisma.config.ts instead.
const adapter = new PrismaNeon({ connectionString: process.env.POSTGRES_PRISMA_URL })

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
