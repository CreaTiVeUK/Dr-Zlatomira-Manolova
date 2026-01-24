import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'zlatomira.manolova@gmail.com' },
        update: {
            password: hashedPassword,
        } as any,
        create: {
            email: 'zlatomira.manolova@gmail.com',
            name: 'Dr. Zlatomira Manolova',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    // Test Admin
    await prisma.user.upsert({
        where: { email: 'admin@sunnypediatrics.com' },
        update: {
            password: hashedPassword,
        } as any,
        create: {
            email: 'admin@sunnypediatrics.com',
            name: 'Test Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    const patient = await prisma.user.upsert({
        where: { email: 'patient@example.com' },
        update: {
            password: hashedPassword,
            failedAttempts: 0,
            lockedUntil: null
        } as any,
        create: {
            email: 'patient@example.com',
            name: 'John Doe',
            password: hashedPassword,
            role: 'PATIENT',
        },
    })

    const patient2 = await prisma.user.upsert({
        where: { email: 'patient2@example.com' },
        update: {
            password: hashedPassword,
            failedAttempts: 0,
            lockedUntil: null
        } as any,
        create: {
            email: 'patient2@example.com',
            name: 'Jane Smith',
            password: hashedPassword,
            role: 'PATIENT',
        },
    })

    console.log({ admin, patient })
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
