#!/bin/sh
set -e

echo "🚀 Starting Kahade API..."

# Wait for PostgreSQL
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for PostgreSQL..."
  # Extract host from DATABASE_URL safely
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\)[:/].*|\1|p')
  DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
  if [ -n "$DB_HOST" ]; then
    until pg_isready -h "$DB_HOST" -U "$DB_USER" 2>/dev/null; do
      echo "PostgreSQL is unavailable - sleeping"
      sleep 2
    done
  fi
  echo "✅ PostgreSQL is up"
fi

# Wait for Redis
if [ -n "$REDIS_HOST" ]; then
  echo "⏳ Waiting for Redis..."
  REDIS_PORT_NUM="${REDIS_PORT:-6379}"
  until nc -z "$REDIS_HOST" "$REDIS_PORT_NUM" 2>/dev/null; do
    echo "Redis is unavailable - sleeping"
    sleep 2
  done
  echo "✅ Redis is up"
fi

# Run migrations
# FIX: schema path must be schema.prisma (not schema — that directory does not exist)
echo "📦 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Start the application
echo "🎯 Starting application..."
exec node dist/main.js
