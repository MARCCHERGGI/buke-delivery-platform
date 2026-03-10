#!/bin/sh
set -eu

echo "Applying Bukë database migrations"

for file in /migrations/*.sql; do
  echo "Running migration: ${file}"
  psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" -f "${file}"
done

echo "Bukë migrations completed"
