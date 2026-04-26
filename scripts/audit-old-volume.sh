#!/usr/bin/env bash
# audit-old-volume.sh — read-only inventory of the legacyshield_minio_data
# Docker volume (the pre-BitAtlas-spinoff blob store), without touching the
# running LegacyShield or BitAtlas stacks.
#
# Why: the audit endpoint showed the active bucket holds 10 objects in
# BitAtlas's `user/<id>/<id>` key format — none of which match the 22
# LegacyShield File rows that write keys as `users/<id>/files/<id>.encrypted`.
# The bytes almost certainly still live in the orphan `legacyshield_minio_data`
# volume from before the spin-off.
#
# Isolation guarantees (deliberate, since legacyshield.eu and bitatlas.com
# share this VM):
#   - Volume is mounted RO via `:ro`
#   - Container and network use `ls-recovery-*` prefix to avoid clobbering
#     anything in either stack
#   - Network is `--internal` (no external connectivity at all)
#   - Sidecar is NOT attached to legacyshield's or bitatlas's docker network
#   - We refuse to start if names collide (no force-remove of unknown stuff)
#   - `trap` ensures the sidecar + network are torn down even on error

set -uo pipefail

SIDECAR="ls-recovery-minio"
NETWORK="ls-recovery-net"
VOLUME="legacyshield_minio_data"

cleanup() {
  docker rm -f "${SIDECAR}" >/dev/null 2>&1 || true
  docker network rm "${NETWORK}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# ---- Pre-flight: refuse to clobber anything ----
if docker ps -a --format '{{.Names}}' | grep -qx "${SIDECAR}"; then
  echo "✗ A container named '${SIDECAR}' already exists. Run 'docker rm -f ${SIDECAR}' if it's stale, then re-run." >&2
  exit 1
fi
if docker network ls --format '{{.Name}}' | grep -qx "${NETWORK}"; then
  echo "✗ A network named '${NETWORK}' already exists. Run 'docker network rm ${NETWORK}' if it's stale, then re-run." >&2
  exit 1
fi
if ! docker volume ls --format '{{.Name}}' | grep -qx "${VOLUME}"; then
  echo "✗ Volume '${VOLUME}' not found. Aborting." >&2
  exit 1
fi

# ---- Isolated docker network (no internet, no other containers) ----
echo "Creating isolated network ${NETWORK}…"
docker network create --internal "${NETWORK}" >/dev/null

# ---- Sidecar MinIO, RO mount of the orphan volume ----
echo "Starting ${SIDECAR} (RO mount of ${VOLUME})…"
docker run -d --rm \
  --name "${SIDECAR}" \
  --network "${NETWORK}" \
  -v "${VOLUME}:/data:ro" \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio:latest server /data >/dev/null

# Wait for readiness (max 15s).
for _ in $(seq 1 15); do
  if docker exec "${SIDECAR}" curl -fsS http://localhost:9000/minio/health/live >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# ---- Enumerate from a one-shot mc client on the same isolated network ----
# minio/mc has `mc` as its entrypoint, so we override to /bin/sh.
# minio/mc's sh is busybox without awk, so we use POSIX parameter expansion
# and sed for parsing.
echo
echo "=== Inventory of ${VOLUME} (RO) ==="
docker run --rm --network "${NETWORK}" --entrypoint /bin/sh minio/mc:latest -c "
  mc alias set old http://${SIDECAR}:9000 minioadmin minioadmin >/dev/null 2>&1
  echo 'Buckets:'
  mc ls old/
  echo
  mc ls old/ | while IFS= read -r line; do
    last=\${line##* }
    b=\${last%/}
    [ -z \"\$b\" ] && continue
    cnt=\$(mc ls --recursive \"old/\$b/\" 2>/dev/null | wc -l)
    echo \"[bucket=\$b  objects=\$cnt]\"
    echo '  sample keys (first 8):'
    mc ls --recursive \"old/\$b/\" 2>/dev/null | head -8 | while IFS= read -r kline; do
      key=\${kline##* }
      echo \"    \$key\"
    done
    echo
  done
"

# trap handles teardown.
echo "Done. Sidecar + network removed."
