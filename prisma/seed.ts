import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * DEV/CI SEED ONLY. This upserts well-known accounts with the shared password
 * 'password123' — including resetting the real admin account's password.
 * Running it against a production database would backdoor the live admin, so
 * it refuses to run unless the database is clearly local (or ALLOW_SEED=1 is
 * set explicitly, e.g. by CI service containers).
 */
function assertSafeTarget(): void {
    if (process.env.ALLOW_SEED === '1') return

    const url = process.env.POSTGRES_PRISMA_URL ?? ''
    const host = (() => {
        try { return new URL(url).hostname } catch { return '' }
    })()
    const localHosts = ['localhost', '127.0.0.1', 'db', 'postgres']

    if (process.env.NODE_ENV === 'production' || !localHosts.includes(host)) {
        console.error(
            `[seed] Refusing to seed non-local database host "${host}". ` +
            'This seed sets known passwords on admin accounts. ' +
            'Set ALLOW_SEED=1 only if you are certain this is a disposable database.'
        )
        process.exit(1)
    }
}

async function main() {
    assertSafeTarget()

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Seed users are pre-verified (no email confirmation needed in dev)
    const now = new Date();

    const admin = await prisma.user.upsert({
        where: { email: 'zlatomira.manolova@gmail.com' },
        update: {
            password: hashedPassword,
            emailVerified: now,
        },
        create: {
            email: 'zlatomira.manolova@gmail.com',
            name: 'Dr. Zlatomira Manolova',
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: now,
        },
    })

    // Test Admin
    await prisma.user.upsert({
        where: { email: 'admin@sunnypediatrics.com' },
        update: {
            password: hashedPassword,
            emailVerified: now,
        },
        create: {
            email: 'admin@sunnypediatrics.com',
            name: 'Test Admin',
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: now,
        },
    })

    const patient = await prisma.user.upsert({
        where: { email: 'patient@example.com' },
        update: {
            password: hashedPassword,
            failedAttempts: 0,
            lockedUntil: null,
            emailVerified: now,
        },
        create: {
            email: 'patient@example.com',
            name: 'John Doe',
            password: hashedPassword,
            role: 'PATIENT',
            emailVerified: now,
        },
    })

    const patient2 = await prisma.user.upsert({
        where: { email: 'patient2@example.com' },
        update: {
            password: hashedPassword,
            failedAttempts: 0,
            lockedUntil: null,
            emailVerified: now,
        },
        create: {
            email: 'patient2@example.com',
            name: 'Jane Smith',
            password: hashedPassword,
            role: 'PATIENT',
            emailVerified: now,
        },
    })

    console.log({ admin, patient, patient2 })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
