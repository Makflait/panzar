#!/bin/sh

# Start the server immediately so Railway healthcheck gets a response
node server.js &
SERVER_PID=$!

# Run migrations + seed in background — errors won't kill the server
(
  sleep 2
  echo "[init] Applying schema..."
  npx prisma db push --accept-data-loss || echo "[init] Schema push failed"
  echo "[init] Seeding..."
  node scripts/seed-prod.mjs || echo "[init] Seed failed"
  echo "[init] Done"
) &

# Keep container alive
wait $SERVER_PID
