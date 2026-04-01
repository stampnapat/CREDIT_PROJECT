#!/usr/bin/env bash
set -e

DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-3306}
MONGO_HOST=${MONGO_HOST:-}
MONGO_PORT=${MONGO_PORT:-27017}

if [ -n "$DB_HOST" ]; then
  echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
  i=0
  until nc -z "$DB_HOST" "$DB_PORT"; do
    i=$((i+1))
    if [ $i -gt 60 ]; then
      echo "Timed out waiting for MySQL"
      exit 1
    fi
    sleep 1
  done
else
  echo "DB_HOST not set. Skipping MySQL host wait (using DATABASE_URL directly)."
fi

if [ -n "$MONGO_HOST" ]; then
  echo "Waiting for Mongo at ${MONGO_HOST}:${MONGO_PORT}..."
  i=0
  until nc -z "$MONGO_HOST" "$MONGO_PORT"; do
    i=$((i+1))
    if [ $i -gt 60 ]; then
      echo "Timed out waiting for Mongo"
      exit 1
    fi
    sleep 1
  done
else
  echo "MONGO_HOST not set. Skipping Mongo host wait (using MONGO_URI directly)."
fi

echo "Running prisma migrate deploy..."
npx prisma migrate deploy || true

echo "Running prisma db seed..."
npx prisma db seed || true

echo "Starting app..."
node dist/server.js
