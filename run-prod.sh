#!/usr/bin/env bash
set -euo pipefail

# Run Freecord in PROD mode using docker-compose.yml

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed. Please install Docker." >&2
  exit 1
fi

# Choose docker compose command
compose_cmd="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  if command::=docker-compose && command -v docker-compose >/dev/null 2>&1; then
    compose_cmd="docker-compose"
  else
    echo "Docker Compose is required. Install docker compose plugin or docker-compose." >&2
    exit 1
  fi
fi

# Ensure prod env file exists
if [ ! -f .env ]; then
  echo "Creating .env from docker.env.example"
  cp docker.env.example .env
  echo "Created .env. Review and fill production values."
fi

echo "Starting Freecord PROD stack (docker-compose.yml) ..."
$compose_cmd -f docker-compose.yml up -d --build

echo "PROD stack is up. Useful notes:"
echo "- App:            http(s)://<your-domain> (e.g., https://miyov.io)"
echo "- LiveKit URL:    Use NEXT_PUBLIC_LIVEKIT_URL in .env (e.g., wss://livekit.miyov.io)"
echo "- Postgres:       localhost:5432"
echo "- Redis:          localhost:6379"

echo "View logs: $compose_cmd logs -f"

