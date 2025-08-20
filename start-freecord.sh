#!/bin/bash

# Freecord with Integrated LiveKit - Start Script

echo "🚀 Starting Freecord with integrated LiveKit server..."
echo "🏗️  Building and starting all services..."

# Stop any existing containers first
sudo docker compose down

# Start all services (PostgreSQL, Redis, LiveKit, Freecord App)
sudo docker compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "📊 Service Status:"
sudo docker compose ps

echo ""
echo "🔗 Access URLs:"
echo "  📱 Freecord App:    http://localhost:3000"
echo "  🎤 LiveKit API:     http://localhost:7880" 
echo "  🗄️  PostgreSQL:     localhost:5432"
echo "  🔴 Redis:           localhost:6379"
echo ""
echo "🔍 Useful commands:"
echo "  sudo docker compose logs -f          # View all logs"
echo "  sudo docker compose logs -f livekit  # LiveKit logs only"
echo "  sudo docker compose logs -f app      # App logs only"
echo "  sudo docker compose down             # Stop all services"
echo ""
echo "✅ Freecord with LiveKit is starting up!"
