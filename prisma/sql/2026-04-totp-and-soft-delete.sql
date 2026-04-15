-- Manual DDL for production rollout.
-- Apply via `psql $POSTGRES_URL_NON_POOLING -f prisma/sql/2026-04-totp-and-soft-delete.sql`
-- or through the Supabase SQL editor. All statements are idempotent.
--
-- This file captures two schema changes rolled out together in April 2026:
--   1. PatientDocument soft-delete + Appointment reminder idempotency
--   2. TOTP 2FA columns on User
--
-- After applying, run `npx prisma generate` locally so the Prisma client
-- picks up the new fields.

BEGIN;

-- ── PatientDocument soft-delete ─────────────────────────────────────────
ALTER TABLE "PatientDocument"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "PatientDocument_userId_deletedAt_idx"
  ON "PatientDocument" ("userId", "deletedAt");

CREATE INDEX IF NOT EXISTS "PatientDocument_deletedAt_idx"
  ON "PatientDocument" ("deletedAt");

-- ── Appointment reminder idempotency ────────────────────────────────────
ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Appointment_dateTime_status_idx"
  ON "Appointment" ("dateTime", "status");

-- ── TOTP 2FA columns on User ────────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "totpSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "totpEnabledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "totpBackupCodes" TEXT;

COMMIT;
