#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --accept-data-loss

echo "Seeding initial data..."
node scripts/seed-prod.mjs

echo "Starting server..."
exec node server.js
