#!/usr/bin/env bash
# audit-old-volume.sh — read-only inventory of the legacyshield_minio_data
# Docker volume (the pre-BitAtlas-spinoff blob store).
#
# Why: after the March 2026 BitAtlas spin-off, the LegacyShield API was
# pointed at `bitatlas-vault` (BitAtlas's bucket, with key format
# `user/<id>/<id>`), but LegacyShield's own code writes keys as
# `users/<id>/files/<id>.encrypted`. The 22 LegacyShield File rows in the
# DB don't match the 10 blobs in `bitatlas-vault`, so the encrypted bytes
# almost certainly still live in the orphan `legacyshield_minio_data`
# volume. This script verifies that without modifying anything.
#
# It:
#   1. Spins up a temporary MinIO container against legacyshield_minio_data
#   2. Lists buckets, object counts, and sample keys
#   3. Tears the temporary container down
#
# Run on the production VM:  bash scripts/audit-old-volume.sh

set -uo pipefail

NET=$(docker inspect legacyshield-api-1 \
        --format '{{range $n,$v := .NetworkSettings.Networks}}{{$n}}{{end}}' 2>/dev/null \
        || true)

if [[ -z "${NET}" ]]; then
  echo "✗ Could not detect docker network for legacyshield-api-1." >&2
  exit 1
fi
echo "Network: ${NET}"

# Tear down any previous run.
docker rm -f minio-old >/dev/null 2>&1 || true

echo "Bringing up minio-old (read of legacyshield_minio_data, port 9100 internal)…"
docker run -d --rm \
  --name minio-old \
  --network "${NET}" \
  -v legacyshield_minio_data:/data:ro \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio:latest server /data >/dev/null

# Give MinIO a couple seconds to come up.
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if docker exec minio-old curl -fsS http://localhost:9000/minio/health/live >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo
echo "=== Inventory of legacyshield_minio_data ==="
docker run --rm --network "${NET}" minio/mc:latest sh -c '
  mc alias set old http://minio-old:9000 minioadmin minioadmin >/dev/null 2>&1
  echo "Buckets:"
  mc ls old/
  echo
  for b in $(mc ls old/ | awk "{print \$NF}" | tr -d /); do
    cnt=$(mc ls --recursive old/$b/ | wc -l)
    echo "[bucket=$b  objects=$cnt]"
    echo "  sample keys (first 5):"
    mc ls --recursive old/$b/ | head -5 | awk "{print \"   \", \$NF}"
    echo
  done
'

echo "=== Tearing down minio-old ==="
docker rm -f minio-old >/dev/null 2>&1 || true

echo "Done."
