#!/bin/bash
set -e

# Create service databases if they don't exist (idempotent for existing volumes)
for db in people_db accounts_db crm_db supplychain_db desk_db finance_db; do
  if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
    echo "Database $db already exists"
  else
    echo "Creating database $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE DATABASE $db"
  fi
done
