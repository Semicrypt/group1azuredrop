#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="/opt/azuredrop"
ENV_FILE="${APP_DIR}/.env.production"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"

cd "${APP_DIR}"

echo "========================================"
echo " AzureDrop Production Deployment"
echo "========================================"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Time:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: ${ENV_FILE} does not exist."
  exit 1
fi

if [[ ! -f /etc/letsencrypt/live/13.48.161.78/fullchain.pem ]] ||
   [[ ! -f /etc/letsencrypt/live/13.48.161.78/privkey.pem ]]; then
  echo "ERROR: AzureDrop TLS certificate is missing."
  exit 1
fi

mkdir -p /var/www/certbot/.well-known/acme-challenge

echo "Validating Docker Compose..."
docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  config >/dev/null

echo "Building application images..."
docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  build

echo "Starting production services..."
docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  up -d --remove-orphans

echo "Waiting for AzureDrop backend health check..."

for attempt in $(seq 1 30); do
  HEALTH="$(
    docker compose \
      --env-file "${ENV_FILE}" \
      -f "${COMPOSE_FILE}" \
      exec -T backend \
      wget \
        --quiet \
        --output-document=- \
        http://127.0.0.1:5000/health \
      2>/dev/null || true
  )"

  if [[ "${HEALTH}" == *'"status":"healthy"'* ]] &&
     [[ "${HEALTH}" == *'"database":"healthy"'* ]] &&
     [[ "${HEALTH}" == *'"storage":"healthy"'* ]]; then

    echo
    echo "AzureDrop deployment healthy."
    echo "${HEALTH}"
    echo

    docker compose \
      --env-file "${ENV_FILE}" \
      -f "${COMPOSE_FILE}" \
      ps

    docker image prune -f >/dev/null 2>&1 || true

    exit 0
  fi

  echo "Health attempt ${attempt}/30..."
  sleep 5
done

echo
echo "ERROR: AzureDrop failed its deployment health gate."

docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  ps -a || true

echo
echo "Recent container logs:"

docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  logs \
  --tail=100 \
  backend \
  frontend \
  storage-init \
  postgres \
  azurite || true

exit 1
