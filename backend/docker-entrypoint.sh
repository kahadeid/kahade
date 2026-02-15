#!/bin/sh
set -e

echo "🚀 Starting Kahade API..."

# Wait for PostgreSQL
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for PostgreSQL..."
  until pg_isready -h $(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p') -U $(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\).*/\1/p'); do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "✅ PostgreSQL is up"
fi

# Wait for Redis
if [ -n "$REDIS_HOST" ]; then
  echo "⏳ Waiting for Redis..."
  until nc -z $REDIS_HOST $REDIS_PORT; do
    echo "Redis is unavailable - sleeping"
    sleep 2
  done
  echo "✅ Redis is up"
fi

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema

# Start the application
echo "🎯 Starting application..."
exec node dist/main.js
