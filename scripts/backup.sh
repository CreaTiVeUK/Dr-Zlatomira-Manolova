#!/bin/sh

# Ensure backups directory exists
mkdir -p /backups

# Get current date
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Perform backup
echo "Starting backup for $POSTGRES_DB at $DATE..."
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h db -U $POSTGRES_USER $POSTGRES_DB | gzip > /backups/backup_$DATE.sql.gz

if [ $? -eq 0 ]; then
  echo "Backup successful: /backups/backup_$DATE.sql.gz"
else
  echo "Backup failed!"
  exit 1
fi

# Delete backups older than 7 days
find /backups -name "backup_*.sql.gz" -mtime +7 -delete
