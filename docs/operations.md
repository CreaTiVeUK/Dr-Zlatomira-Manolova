# Operations and recovery

## Appointment reminders

`/api/cron/send-reminders` is scheduled at **09:00 UTC daily** in `vercel.json`.
It selects BOOKED appointments in the next 48 hours with no `reminderSentAt`.
The wider window accommodates daily scheduling; this is not an exact 24-hour
reminder service. Bookings made after the daily run for an appointment before
the next run may receive no reminder. The appointment confirmation remains
separate from reminders.

Required production configuration: `CRON_SECRET`, `RESEND_API_KEY`, a Resend-verified
`EMAIL_FROM`, and `APP_URL=https://www.drmanolova.bg`. Do not expose these values
in logs or client-side environment variables. A missing secret/email configuration
returns 503; a wrong bearer token returns 401. Vercel supplies the bearer token
for its scheduled request. Preview deployments are not a live-email test environment.

Reminders contain both Bulgarian and English because user accounts currently do
not store a preferred email language. Dates and times explicitly use Europe/Sofia,
including daylight-saving changes. Emails link to `/my-appointments`.

Successful sends are recorded on the appointment. Rescheduling resets the marker;
a reminder for the old time cannot mark the new time as already reminded. A stable
Resend idempotency key combines the appointment ID and scheduled instant. This
protects overlapping requests and retries for **24 hours** ([Resend documentation](https://resend.com/docs/dashboard/emails/idempotency-keys)).
It is not a permanent exactly-once guarantee. If Resend accepts an email but the
database write fails, retry within 24 hours using the same deployment/configuration.
After that, inspect the provider delivery record before retrying, to avoid sending
again. Cancellation/rescheduling can still race with an email already being sent.

A response with failed deliveries has HTTP 503 and `success: false`; successful
items remain marked and are skipped on retry. Watch `failed`, `sent`, and Vercel
function errors/timeouts in cron logs. A provider rate-limit error also leaves that
appointment pending. Vercel cron failure should not be assumed to auto-retry:
rerun the protected endpoint using your secret manager within the retry window.
Do not put the bearer token into saved shell history. Monitor provider delivery
and bounce events separately; provider acceptance is not proof of inbox delivery.

Before enabling on a new environment, verify the configuration and send a reminder
for an explicitly designated test account. Never trigger the production job as a
smoke test: it sends mail to every eligible patient.

## Backups

The Compose backup container is for **self-hosted PostgreSQL only**. It does not
back up the database used by Vercel. Archives live in the Compose **named volume
`backups`**, mounted at `/backups`, not a host `./backups` directory.

The script stages the SQL dump, checks `pg_dump` success, compresses it, and then
renames it into place. Failed dumps leave no published archive. Files are created
with owner-only permissions. Success runs daily; failures retry after five minutes.
Completed files older than seven days are removed only following a successful run.
Alert on repeated failures and on the absence of a recent completed archive.

For a manual self-hosted backup:

```sh
docker compose exec backup sh /scripts/backup.sh
docker compose exec backup sh -c 'ls -lt /backups/backup_*.sql.gz'
```

Copy archives to encrypted, access-controlled off-host storage: a Docker volume
on the same machine is not disaster recovery. Retain the PII encryption key in a
separate secured recovery store; SQL alone cannot recover encrypted fields without
that key. Blob/document storage needs its own backup/retention policy.

### Restore drill

Use a **new, disposable database**, never an existing patient database. Use a
matching PostgreSQL client and credentials provided through your secret manager:

```sh
# Substitute a selected completed archive and a new scratch database name.
gzip -t /secure/path/backup.sql.gz
gzip -dc /secure/path/backup.sql.gz > /secure/path/restore.sql
createdb clinic_restore_drill
psql -v ON_ERROR_STOP=1 -d clinic_restore_drill -f /secure/path/restore.sql
```

Check schema and record counts, then point an isolated app at the restored database
and check a designated test account/document. Disable email and all cron jobs for
the drill. Remove the scratch database and uncompressed SQL securely afterwards.
For Vercel's hosted database, verify provider backup retention, point-in-time
recovery availability, and a restore drill separately in the database provider's
console. Repository configuration does not establish that those backups exist.

## Monitoring and deployment recovery

- Use `/api/health` for database/Redis health and an external uptime monitor for the
  public site. Check actual health fields as well as HTTP status.
- Review GitHub CI, CodeQL, image publishing, and Vercel deployment status after
  each push. Use Vercel runtime logs for application and cron failures.
- `SENTRY_DSN` alone does **not** enable Sentry here: the optional SDK is not
  installed/configured. Existing JSON logs are the available error-reporting path.
  Select and configure an alert destination before relying on unattended alerts.
- If a deployment fails, promote the last known-good Vercel deployment, then verify
  health, login, booking and messaging with a test account. Do not roll back database
  schemas blindly; none of this change requires a schema migration.
- Confirm backups, delivery monitoring, and alert routing with the service owner;
  local tests cannot verify these account-level settings.
