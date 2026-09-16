#!/bin/sh
set -eu
umask 077

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
BACKUP_DIR=${BACKUP_DIR:-/backups}
mkdir -p "$BACKUP_DIR"
# Stage separately: POSIX sh pipelines otherwise hide pg_dump failures.
BACKUP_STAGE=$(mktemp -d "$BACKUP_DIR/.backup.XXXXXXXX")
trap 'rm -rf "$BACKUP_STAGE"' EXIT
trap 'exit 1' HUP INT TERM
export PGPASSWORD=${POSTGRES_PASSWORD:-}
pg_dump -h "${POSTGRES_HOST:-db}" -p "${POSTGRES_PORT:-5432}" \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl \
  -f "$BACKUP_STAGE/dump.sql"
gzip "$BACKUP_STAGE/dump.sql"
BACKUP_PATH="$BACKUP_DIR/backup_$(date -u +%Y-%m-%d_%H-%M-%S)_${BACKUP_STAGE##*.}.sql.gz"
mv "$BACKUP_STAGE/dump.sql.gz" "$BACKUP_PATH"
echo "Backup successful: $BACKUP_PATH"
# Only completed backups are eligible for retention cleanup.
find "$BACKUP_DIR" -type f -name 'backup_*.sql.gz' -mtime +7 -exec rm -f {} \;
