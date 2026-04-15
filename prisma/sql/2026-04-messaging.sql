-- Manual DDL for the in-app messaging rollout.
-- Apply via `psql $POSTGRES_URL_NON_POOLING -f prisma/sql/2026-04-messaging.sql`.
-- All statements are idempotent.

BEGIN;

ALTER TABLE "Message"
  ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Message_toId_readAt_idx"
  ON "Message" ("toId", "readAt");

CREATE INDEX IF NOT EXISTS "Message_fromId_toId_timestamp_idx"
  ON "Message" ("fromId", "toId", "timestamp");

COMMIT;
