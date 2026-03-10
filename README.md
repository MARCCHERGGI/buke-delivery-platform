# Bukë Delivery Platform

Bukë is a food delivery platform for Pogradec, Albania. This repository contains:

- `buke-api/`: Node.js Express API with PostgreSQL integration
- `docker/`: local gateway, Postgres bootstrap, and deployment Docker assets
- `frontend/buke-rn-design-system/`: React Native design system and screens
- `docker-compose.yml`: local full-stack runtime

## Local Run

1. Copy the env file:

```powershell
Copy-Item .env.docker.example .env
```

2. Build and start the stack:

```powershell
docker compose build
docker compose up -d
```

3. Verify:

- Frontend: `http://localhost`
- Backend: `http://localhost:3000/health`
- Restaurants API: `http://localhost:3000/restaurants`

## Seed Data

The Pogradec restaurant seed is included in:

- `buke-api/migrations/005_seed_pogradec.sql`

On a fresh Postgres volume, the Docker bootstrap applies all migrations automatically. On an existing volume:

```powershell
docker exec buke-database psql -U buke -d buke -f /migrations/005_seed_pogradec.sql
```

## Public Deployment Notes

- The backend Dockerfile is at `buke-api/Dockerfile`
- The frontend Dockerfile is at `docker/frontend/Dockerfile`
- The Fly-compatible Postgres image is at `docker/postgres/Dockerfile`
- The frontend proxy target is configurable through `API_UPSTREAM`

## Core Endpoints

- `GET /health`
- `GET /restaurants`
- `GET /restaurants/:id/menu`
- `POST /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`
- `POST /driver/location`
- `POST /driver/accept`
