#!/bin/bash
# Backup critical workspace files to a private local git repo
BACKUP_DIR="$HOME/.openclaw/workspace-backup"
WORKSPACE="$HOME/.openclaw/workspace"

mkdir -p "$BACKUP_DIR/memory" "$BACKUP_DIR/.learnings"

# Copy critical files
for f in MEMORY.md IDENTITY.md USER.md SOUL.md AGENTS.md TOOLS.md HEARTBEAT.md; do
  [ -f "$WORKSPACE/$f" ] && cp "$WORKSPACE/$f" "$BACKUP_DIR/$f"
done

# Copy memory directory
cp "$WORKSPACE"/memory/*.md "$BACKUP_DIR/memory/" 2>/dev/null

# Copy learnings
cp "$WORKSPACE"/.learnings/*.md "$BACKUP_DIR/.learnings/" 2>/dev/null

# Commit changes
cd "$BACKUP_DIR"
git add -A
git diff --cached --quiet || git commit -m "backup: $(date '+%Y-%m-%d %H:%M')" --quiet
