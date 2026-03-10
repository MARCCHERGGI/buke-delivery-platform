# Bukë Docker Deployment

## Services

- `frontend`: Nginx static gateway on port `8080` by default
- `backend`: Express API on port `3000` by default
- `database`: PostgreSQL 16 with automatic first-boot migration bootstrap
- `redis`: Redis 7 with append-only persistence

## Start

1. Copy `.env.docker.example` to `.env`.
2. Adjust credentials and host ports if needed.
3. Run `docker compose up --build`.

## Notes

- PostgreSQL migrations from `buke-api/migrations/*.sql` are applied automatically on the first database boot.
- API traffic is routed through the frontend container under `/api/`.
- Redis is provisioned for queueing, caching, and notification fan-out, even though the current backend runtime does not consume it yet.
