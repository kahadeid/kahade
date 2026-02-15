#!/bin/bash
# Database Backup Utilities (MEDIUM-020)

set -e

# Load environment variables
source .env

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/kahade_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Starting database backup..."

# Backup database
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Remove old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "🧹 Cleaned up backups older than $RETENTION_DAYS days"

# Calculate backup size
SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo "📊 Backup size: $SIZE"

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
  echo "☁️ Uploading to S3..."
  aws s3 cp "${BACKUP_FILE}.gz" "s3://$AWS_S3_BACKUP_BUCKET/backups/"
  echo "✅ Uploaded to S3"
fi

echo "✅ Backup completed successfully!"

# Usage:
# chmod +x scripts/backup-database.sh
# ./scripts/backup-database.sh
#
# Cron job (daily at 2 AM):
# 0 2 * * * /path/to/backup-database.sh >> /var/log/backup.log 2>&1
