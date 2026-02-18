#!/bin/bash
set -euo pipefail

DB_PASSWORD=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/attributes/db-password" -H "Metadata-Flavor: Google")
ENVIRONMENT=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/attributes/environment" -H "Metadata-Flavor: Google")

# Create persistent data directories
mkdir -p /mnt/disks/data/postgres /mnt/disks/data/dragonfly

# Run PostgreSQL 16
docker run -d \
  --name postgres \
  --restart always \
  -p 5432:5432 \
  -v /mnt/disks/data/postgres:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
  postgres:16-alpine

# Wait for PostgreSQL readiness
for i in $(seq 1 30); do
  if docker exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

# Create database for this environment
docker exec postgres psql -U postgres -c "CREATE DATABASE servio_${ENVIRONMENT};" 2>/dev/null || true

# Run Dragonfly (Redis-compatible)
docker run -d \
  --name dragonfly \
  --restart always \
  -p 6379:6379 \
  -v /mnt/disks/data/dragonfly:/data \
  --ulimit memlock=-1 \
  docker.dragonflydb.io/dragonflydb/dragonfly:latest \
  --maxmemory 256mb
