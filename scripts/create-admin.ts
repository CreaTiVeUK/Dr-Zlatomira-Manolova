/**
 * Creates or resets the admin account in the database.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 *
 * Set DATABASE_URL (or POSTGRES_PRISMA_URL) in your environment before running.
 * On Vercel: run via `vercel env pull .env.local && npx tsx scripts/create-admin.ts`
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@manolova-pediatrics.com";
const ADMIN_PASSWORD = "DrZlati@Admin2026!";
const ADMIN_NAME = "Dr. Zlatomira Manolova";

async function main() {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const user = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {
            password: hash,
            role: "ADMIN",
            emailVerified: new Date(),
            failedAttempts: 0,
            lockedUntil: null,
        },
        create: {
            email: ADMIN_EMAIL,
            name: ADMIN_NAME,
            password: hash,
            role: "ADMIN",
            emailVerified: new Date(),
        },
    });

    console.log("\n✅ Admin account ready\n");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ${user.role}`);
    console.log(`   ID:       ${user.id}`);
    console.log("\n⚠️  Change the password after first login.\n");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
