#!/usr/bin/env bash
# recover-legacy-minio.sh — promote the orphan legacyshield_minio_data volume
# back into service by spinning up a dedicated MinIO container for it, then
# pointing the LegacyShield API at it.
#
# Why: the audit revealed the running `legacyshield-minio-1` mounts a
# different volume than `legacyshield_minio_data`, which is where our 30
# encrypted blobs (22 active + 3 deleted + 5 historical) actually live —
# under bucket `legacy-shield-vault`, in the right LegacyShield key format
# (`users/<id>/files/<id>.encrypted`).
#
# Strategy: don't touch BitAtlas. Don't modify the running legacyshield-minio-1
# or its volume. Add a new container `ls-legacy-minio` that owns the orphan
# volume and is reachable from the LegacyShield API by service name. Update
# .env.prod to point STORAGE_ENDPOINT at it, and STORAGE_BUCKET back to
# `legacy-shield-vault`. Restart only the API container.
#
# Usage:
#   bash scripts/recover-legacy-minio.sh           # dry-run — prints what would happen
#   bash scripts/recover-legacy-minio.sh --apply   # actually does it

set -uo pipefail

NEW_MINIO="ls-legacy-minio"
SOURCE_VOLUME="legacyshield_minio_data"
TARGET_BUCKET="legacy-shield-vault"
ENV_FILE="/opt/legacyshield/.env.prod"
COMPOSE_FILE="/opt/legacyshield/docker-compose.prod.yml"
API_CONTAINER="legacyshield-api-1"

APPLY="false"
[[ "${1:-}" == "--apply" ]] && APPLY="true"

if [[ "$APPLY" == "false" ]]; then
  echo "DRY-RUN. Re-run with --apply to execute."
  echo
fi

step() { echo "→ $*"; }
do_it() { if [[ "$APPLY" == "true" ]]; then eval "$@"; fi }

# ---- Pre-flight ----
if ! docker volume ls --format '{{.Name}}' | grep -qx "${SOURCE_VOLUME}"; then
  echo "✗ Volume '${SOURCE_VOLUME}' not found." >&2; exit 1
fi
if docker ps -a --format '{{.Names}}' | grep -qx "${NEW_MINIO}"; then
  echo "✗ A container named '${NEW_MINIO}' already exists. If safe, remove it (docker rm -f ${NEW_MINIO}) and re-run." >&2; exit 1
fi
if ! docker ps --format '{{.Names}}' | grep -qx "${API_CONTAINER}"; then
  echo "✗ Container '${API_CONTAINER}' is not running." >&2; exit 1
fi
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "✗ ${ENV_FILE} not found." >&2; exit 1
fi
if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "✗ ${COMPOSE_FILE} not found." >&2; exit 1
fi

# Detect the docker network the LegacyShield API uses.
NET=$(docker inspect "${API_CONTAINER}" \
        --format '{{range $n,$v := .NetworkSettings.Networks}}{{$n}}{{"\n"}}{{end}}' \
      | grep -v '^$' | head -n1)
if [[ -z "${NET}" ]]; then
  echo "✗ Could not detect LegacyShield API docker network." >&2; exit 1
fi

# Read current creds from .env.prod (the new MinIO will use the same so the API
# auth keeps working — credentials are scoped to the new container).
ACCESS_KEY=$(grep -E '^STORAGE_ACCESS_KEY=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)
SECRET_KEY=$(grep -E '^STORAGE_SECRET_KEY=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)
if [[ -z "${ACCESS_KEY}" || -z "${SECRET_KEY}" ]]; then
  echo "✗ STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY missing in ${ENV_FILE}." >&2; exit 1
fi

CURRENT_ENDPOINT=$(grep -E '^STORAGE_ENDPOINT=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)
CURRENT_BUCKET=$(grep -E '^STORAGE_BUCKET=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)

echo "Plan:"
echo "  Source volume    : ${SOURCE_VOLUME}"
echo "  New container    : ${NEW_MINIO}"
echo "  Network          : ${NET}"
echo "  Current endpoint : ${CURRENT_ENDPOINT}"
echo "  Current bucket   : ${CURRENT_BUCKET}"
echo "  → New endpoint   : http://${NEW_MINIO}:9000"
echo "  → New bucket     : ${TARGET_BUCKET}"
echo
echo "Backups will be written for the env file."
echo

# ---- Step 1: backup .env.prod ----
TS=$(date +%s)
BACKUP="${ENV_FILE}.bak.${TS}"
step "Backup ${ENV_FILE} → ${BACKUP}"
do_it "cp -p '${ENV_FILE}' '${BACKUP}'"

# ---- Step 2: start the new MinIO mounting the orphan volume ----
step "Start ${NEW_MINIO} on network ${NET}, mounting ${SOURCE_VOLUME} at /data"
do_it "docker run -d --name '${NEW_MINIO}' \
  --network '${NET}' \
  --restart unless-stopped \
  -v '${SOURCE_VOLUME}:/data' \
  -e MINIO_ROOT_USER='${ACCESS_KEY}' \
  -e MINIO_ROOT_PASSWORD='${SECRET_KEY}' \
  minio/minio:latest server /data >/dev/null"

# ---- Step 3: wait for readiness ----
step "Wait up to 20s for ${NEW_MINIO} health"
do_it "for _ in \$(seq 1 20); do
  if docker exec '${NEW_MINIO}' curl -fsS http://localhost:9000/minio/health/live >/dev/null 2>&1; then
    break
  fi
  sleep 1
done"

# ---- Step 4: update env vars ----
step "Update STORAGE_ENDPOINT in ${ENV_FILE} → http://${NEW_MINIO}:9000"
do_it "sed -i 's|^STORAGE_ENDPOINT=.*|STORAGE_ENDPOINT=http://${NEW_MINIO}:9000|' '${ENV_FILE}'"
step "Update STORAGE_BUCKET in ${ENV_FILE} → ${TARGET_BUCKET}"
do_it "sed -i 's|^STORAGE_BUCKET=.*|STORAGE_BUCKET=${TARGET_BUCKET}|' '${ENV_FILE}'"

# ---- Step 5: restart only the API container ----
step "Recreate the LegacyShield API container with new env"
do_it "(cd /opt/legacyshield && docker compose -f docker-compose.prod.yml up -d --force-recreate api)"

# ---- Step 6: verify ----
step "Probe storage health"
if [[ "$APPLY" == "true" ]]; then
  sleep 3
  curl -sS https://api.legacyshield.eu/api/v1/health/storage
  echo
fi

echo
if [[ "$APPLY" == "true" ]]; then
  echo "✓ Done. The API now reads from ${SOURCE_VOLUME}'s ${TARGET_BUCKET} bucket."
  echo "  Reload the documents page; downloads should work."
  echo "  Rollback: cp ${BACKUP} ${ENV_FILE} && docker rm -f ${NEW_MINIO} && docker compose -f docker-compose.prod.yml up -d --force-recreate api"
else
  echo "Dry-run complete. To execute:  bash $0 --apply"
fi
