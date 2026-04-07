#!/usr/bin/env bash
# Incremental mine of memory/ + MEMORY.md into the local MemPalace index.
# Read-mostly secondary index. Source of truth remains MEMORY.md.
# See heartbeat for scheduling.

set -euo pipefail

WORKSPACE="/Users/stephenballot/.openclaw/workspace"
VENV="$WORKSPACE/.mempalace/.venv"
PALACE="$WORKSPACE/.mempalace/palace"
LOG="$WORKSPACE/.mempalace/refresh.log"

mkdir -p "$(dirname "$LOG")"

# Make sure global config points at our palace (not /tmp from the bake-off).
python3 - <<'PY' >/dev/null
import json, os
p = os.path.expanduser("~/.mempalace/config.json")
if os.path.exists(p):
    c = json.load(open(p))
    target = "/Users/stephenballot/.openclaw/workspace/.mempalace/palace"
    if c.get("palace_path") != target:
        c["palace_path"] = target
        json.dump(c, open(p, "w"), indent=2)
PY

source "$VENV/bin/activate"

{
  echo "=== $(date -Iseconds) ==="
  # mine the daily journal directory
  mempalace mine "$WORKSPACE/memory" --mode convos 2>&1 || true
  # MEMORY.md must be mined via a directory; stage it in a temp scratch
  STAGE="$WORKSPACE/.mempalace/.stage_memory_md"
  mkdir -p "$STAGE"
  cp "$WORKSPACE/MEMORY.md" "$STAGE/MEMORY.md"
  mempalace mine "$STAGE" --mode convos 2>&1 || true
  echo
} >> "$LOG"

echo "mempalace refreshed → $PALACE"
