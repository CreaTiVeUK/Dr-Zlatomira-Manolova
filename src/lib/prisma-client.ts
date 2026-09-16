import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';

/** Neon uses its WebSocket transport; standard PostgreSQL (including CI and
 * Compose) requires TCP. Keep every app, script and test on the same choice. */
export function createPrismaClient(connectionString = process.env.POSTGRES_PRISMA_URL) {
    const hostname = connectionString ? new URL(connectionString).hostname : '';
    const adapter = hostname.endsWith('.neon.tech')
        ? new PrismaNeon({ connectionString })
        : new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
}
