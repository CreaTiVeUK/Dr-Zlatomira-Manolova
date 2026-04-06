import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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
