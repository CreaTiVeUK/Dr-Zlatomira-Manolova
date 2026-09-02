/**
 * Creates (or resets) an admin account.
 *
 * The password is NEVER hardcoded here. A committed credential is a permanent
 * backdoor — it stays in git history after any later edit — and this dashboard
 * exposes patient records. Supply one via ADMIN_PASSWORD, or let the script
 * generate a random one and print it once.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com npm run create-admin
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run create-admin
 *   ADMIN_EMAIL=… npm run create-admin -- --check   # read-only: does this account exist?
 *   ADMIN_EMAIL=… npm run create-admin -- --promote # promote an existing account, no password
 *   ADMIN_EMAIL=… npm run create-admin -- --force   # overwrite an existing account
 *
 * Set DATABASE_URL (or POSTGRES_PRISMA_URL) in your environment before running.
 * On Vercel: `vercel env pull .env.local && npx tsx scripts/create-admin.ts`
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { checkPasswordStrength } from "../src/lib/password-strength";

const prisma = new PrismaClient();

/** Random, URL-safe, and comfortably past the zxcvbn-3 policy. */
function generatePassword(): string {
    return randomBytes(18).toString("base64url");
}

/**
 * Grant ADMIN to an account that already exists, without touching its password.
 * This is the safe way to admin an OAuth-only user: adding a password would
 * break their provider sign-in, and no new credential is created that could
 * later leak.
 */
async function promoteExisting(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, password: true, emailVerified: true },
    });

    if (!user) {
        throw new Error(`${email} does not exist. Drop --promote to create it.`);
    }
    if (user.role === "ADMIN") {
        console.log(`\n✅ ${email} is already ADMIN — nothing to do.\n`);
        return;
    }

    const updated = await prisma.user.update({
        where: { email },
        data: {
            role: "ADMIN",
            // An unverified address cannot use credential login. Harmless for an
            // OAuth account, and avoids a dead end if a password is added later.
            emailVerified: user.emailVerified ?? new Date(),
        },
        select: { id: true, role: true },
    });

    await prisma.auditLog.create({
        data: {
            action: "ADMIN_ROLE_GRANTED",
            details: `${email} promoted from ${user.role} to ADMIN via scripts/create-admin.ts`,
            userId: updated.id,
        },
    });

    console.log(`\n✅ ${email} promoted ${user.role} → ${updated.role}\n`);
    console.log(`   ID:       ${updated.id}`);
    console.log(`   Sign-in:  ${user.password ? "password (unchanged)" : "Google (password still NULL)"}`);
    console.log("\n⚠️  Enable 2FA on this account from /admin/security.\n");
}

async function main() {
    const force = process.argv.includes("--force");
    const promote = process.argv.includes("--promote");
    const check = process.argv.includes("--check");
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const name = process.env.ADMIN_NAME?.trim() || "Administrator";

    if (!email) {
        throw new Error(
            "ADMIN_EMAIL is required.\n" +
            "  Example: ADMIN_EMAIL=you@example.com npm run create-admin"
        );
    }

    if (check) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, password: true, emailVerified: true, createdAt: true },
        });
        if (!user) {
            console.log(`\n${email}: does not exist\n`);
        } else {
            console.log(`\n${email}: EXISTS`);
            console.log(`   role:      ${user.role}`);
            console.log(`   password:  ${user.password ? "SET" : "NULL (OAuth only)"}`);
            console.log(`   verified:  ${user.emailVerified ? "yes" : "no"}`);
            console.log(`   created:   ${user.createdAt.toISOString()}\n`);
        }
        return;
    }

    if (promote) {
        await promoteExisting(email);
        return;
    }

    const supplied = process.env.ADMIN_PASSWORD;
    const password = supplied || generatePassword();

    // Hold a supplied password to the same policy the registration form
    // enforces; a generated one is random and passes trivially.
    const strength = checkPasswordStrength(password, [email, name]);
    if (!strength.valid) {
        throw new Error(`ADMIN_PASSWORD rejected: ${strength.reason}`);
    }

    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, password: true },
    });

    // Setting a password on an OAuth-only account breaks Google sign-in: the
    // auto-linking guard refuses to link a provider identity to an account
    // that already has a password.
    if (existing && existing.password === null && !force) {
        throw new Error(
            `${email} already exists (role ${existing.role}) with no password — it signs in via OAuth.\n` +
            "Adding a password would break that sign-in. Use a different address, " +
            "or pass --force if you are certain."
        );
    }

    if (existing && !force) {
        throw new Error(
            `${email} already exists (role ${existing.role}). ` +
            "Re-run with --force to reset its password and promote it to ADMIN."
        );
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hash,
            role: "ADMIN",
            emailVerified: new Date(),
            failedAttempts: 0,
            lockedUntil: null,
        },
        create: {
            email,
            name,
            password: hash,
            role: "ADMIN",
            // Verified on creation: this account is provisioned out-of-band, and
            // no verification mail can be sent while Resend is unconfigured.
            emailVerified: new Date(),
        },
    });

    await prisma.auditLog.create({
        data: {
            action: existing ? "ADMIN_ACCOUNT_RESET" : "ADMIN_ACCOUNT_CREATED",
            details: `${email} provisioned via scripts/create-admin.ts`,
            userId: user.id,
        },
    });

    console.log(`\n✅ Admin account ${existing ? "reset" : "created"}\n`);
    console.log(`   Email: ${email}`);
    console.log(`   Role:  ${user.role}`);
    console.log(`   ID:    ${user.id}`);
    if (supplied) {
        console.log("\n   Password: (the one you supplied)");
    } else {
        console.log(`\n   Password: ${password}`);
        console.log("   ^ shown once and stored only as a bcrypt hash. Save it now.");
    }
    console.log("\n⚠️  Enable 2FA on this account from /admin/security after first login.\n");
}

main()
    .catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); })
    .finally(() => prisma.$disconnect());
