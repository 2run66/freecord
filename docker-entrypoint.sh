#!/bin/sh

# Docker entrypoint script for Freecord

echo "🐳 Starting Freecord application..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Start the application
echo "🚀 Starting the server..."
exec node server.js