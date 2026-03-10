FROM postgres:16-alpine

COPY docker/postgres/init/ /docker-entrypoint-initdb.d/
COPY buke-api/migrations/ /migrations/

RUN chmod +x /docker-entrypoint-initdb.d/00-apply-migrations.sh
