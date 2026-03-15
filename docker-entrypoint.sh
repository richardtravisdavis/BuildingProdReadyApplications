#!/bin/sh
set -e

missing=""

for var in DATABASE_URL BETTER_AUTH_SECRET BETTER_AUTH_URL RESEND_API_KEY EMAIL_FROM; do
  eval val=\$$var
  if [ -z "$val" ]; then
    missing="$missing $var"
  fi
done

if [ -n "$missing" ]; then
  echo "ERROR: Missing required environment variables:$missing"
  echo ""
  echo "Set them in a .env file or pass them to docker compose."
  echo "See .env.docker.example for reference."
  exit 1
fi

exec "$@"
