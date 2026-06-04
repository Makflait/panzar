#!/bin/sh

# Start the Next.js server immediately so healthcheck can respond
node server.js &
SERVER_PID=$!

# Run migrations in background after a short delay
(sleep 5 && echo "Running migrations..." && npx prisma db push --accept-data-loss && echo "Migrations done.") &

# Wait for the server process (keeps container alive)
wait $SERVER_PID
