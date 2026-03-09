#!/bin/bash
set -euo pipefail

# ============================================
# LegacyShield Safe Deploy Script
# Prevents broken deploys from going live.
# ============================================

DEPLOY_DIR="/opt/legacyshield/app"
WEB_DIR="$DEPLOY_DIR/packages/web"
COMPOSE_FILE="/opt/legacyshield/docker-compose.prod.yml"
DOMAIN="https://legacyshield.eu"
API_DOMAIN="https://api.legacyshield.eu"
ROLLBACK_HASH=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# ============================================
# Phase 1: Pre-flight checks
# ============================================
preflight() {
    log "Phase 1: Pre-flight checks"

    # Save current hash for rollback
    cd "$DEPLOY_DIR"
    ROLLBACK_HASH=$(git rev-parse HEAD)
    log "Current commit: $ROLLBACK_HASH (rollback target)"

    # Check services are running
    pm2 describe legacyshield-web > /dev/null 2>&1 || fail "PM2 web process not found"
    docker compose -f "$COMPOSE_FILE" ps api | grep -q "Up" || fail "API container not running"
    docker compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up" || fail "Postgres not running"
    docker compose -f "$COMPOSE_FILE" ps redis | grep -q "Up" || fail "Redis not running"

    log "All services running ✅"
}

# ============================================
# Phase 2: Pull & Build (don't restart yet)
# ============================================
build() {
    log "Phase 2: Pull & Build"

    cd "$DEPLOY_DIR"
    git pull origin main || fail "Git pull failed"
    
    NEW_HASH=$(git rev-parse HEAD)
    if [ "$NEW_HASH" = "$ROLLBACK_HASH" ]; then
        log "No new commits. Nothing to deploy."
        exit 0
    fi
    log "New commit: $NEW_HASH"

    # Build web (but don't restart PM2 yet)
    cd "$WEB_DIR"
    rm -rf .next
    NEXT_PUBLIC_API_URL="$API_DOMAIN" npm run build 2>&1 || {
        warn "Build failed! Rolling back..."
        rollback
        fail "Build failed. Rolled back to $ROLLBACK_HASH"
    }

    log "Build succeeded ✅"
}

# ============================================
# Phase 3: Static asset validation
# ============================================
validate_build() {
    log "Phase 3: Validating build artifacts"

    # Check .next directory exists
    [ -d "$WEB_DIR/.next" ] || fail ".next directory missing"
    [ -d "$WEB_DIR/.next/static" ] || fail ".next/static directory missing"
    [ -d "$WEB_DIR/.next/static/css" ] || fail "No CSS files generated"
    [ -d "$WEB_DIR/.next/static/chunks" ] || fail "No JS chunks generated"

    # Count CSS files
    CSS_COUNT=$(find "$WEB_DIR/.next/static/css" -name "*.css" | wc -l)
    [ "$CSS_COUNT" -gt 0 ] || fail "No CSS files found in build"

    # Check no localhost:4000 in client bundles
    LOCALHOST_REFS=$(grep -rl 'localhost:4000' "$WEB_DIR/.next/static/" 2>/dev/null | wc -l)
    [ "$LOCALHOST_REFS" -eq 0 ] || fail "Found localhost:4000 in client bundles! NEXT_PUBLIC_API_URL not set correctly."

    # Verify NEXT_PUBLIC_API_URL is baked in
    grep -rl 'api.legacyshield.eu' "$WEB_DIR/.next/static/" > /dev/null 2>&1 || warn "api.legacyshield.eu not found in bundles (may be OK if no API calls in static chunks)"

    log "Build artifacts valid ✅"
}

# ============================================
# Phase 4: Deploy (restart PM2)
# ============================================
deploy() {
    log "Phase 4: Deploying..."

    pm2 restart legacyshield-web
    sleep 3

    # Verify PM2 process is online
    pm2 describe legacyshield-web | grep -q "online" || {
        warn "PM2 process not online! Rolling back..."
        rollback
        fail "PM2 restart failed. Rolled back."
    }

    log "PM2 restarted ✅"
}

# ============================================
# Phase 5: Smoke tests (the important bit)
# ============================================
smoke_test() {
    log "Phase 5: Smoke tests"
    FAILURES=0

    # Test 1: Homepage returns 200
    HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/)
    if [ "$HTTP_CODE" = "200" ]; then
        log "  ✅ Homepage: 200"
    else
        warn "  ❌ Homepage: $HTTP_CODE"
        FAILURES=$((FAILURES + 1))
    fi

    # Test 2: CSS file returns 200 (via Nginx)
    CSS_FILE=$(ls "$WEB_DIR/.next/static/css/" | head -1)
    if [ -n "$CSS_FILE" ]; then
        HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" --max-time 10 "$DOMAIN/_next/static/css/$CSS_FILE")
        if [ "$HTTP_CODE" = "200" ]; then
            log "  ✅ CSS via Nginx: 200"
        else
            warn "  ❌ CSS via Nginx: $HTTP_CODE"
            FAILURES=$((FAILURES + 1))
        fi
    fi

    # Test 3: JS chunk returns 200
    JS_FILE=$(ls "$WEB_DIR/.next/static/chunks/" | grep "webpack" | head -1)
    if [ -n "$JS_FILE" ]; then
        HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" --max-time 10 "$DOMAIN/_next/static/chunks/$JS_FILE")
        if [ "$HTTP_CODE" = "200" ]; then
            log "  ✅ JS via Nginx: 200"
        else
            warn "  ❌ JS via Nginx: $HTTP_CODE"
            FAILURES=$((FAILURES + 1))
        fi
    fi

    # Test 4: API health
    HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:4000/api/v1)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "404" ]; then
        log "  ✅ API reachable: $HTTP_CODE"
    else
        warn "  ❌ API unreachable: $HTTP_CODE"
        FAILURES=$((FAILURES + 1))
    fi

    # Test 5: Login page renders (not a blank page)
    BODY_SIZE=$(curl -s --max-time 10 http://127.0.0.1:3000/login | wc -c)
    if [ "$BODY_SIZE" -gt 1000 ]; then
        log "  ✅ Login page renders: ${BODY_SIZE} bytes"
    else
        warn "  ❌ Login page too small: ${BODY_SIZE} bytes (possibly blank)"
        FAILURES=$((FAILURES + 1))
    fi

    # Test 6: Pension calculator page
    HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/calculators/pension)
    if [ "$HTTP_CODE" = "200" ]; then
        log "  ✅ Pension calculator: 200"
    else
        warn "  ❌ Pension calculator: $HTTP_CODE"
        FAILURES=$((FAILURES + 1))
    fi

    # Test 7: Check homepage contains expected content
    curl -s --max-time 10 http://127.0.0.1:3000/ | grep -q "LegacyShield" || {
        warn "  ❌ Homepage missing 'LegacyShield' text"
        FAILURES=$((FAILURES + 1))
    }
    log "  ✅ Homepage content check passed"

    # Verdict
    if [ "$FAILURES" -gt 0 ]; then
        warn "$FAILURES smoke test(s) failed! Rolling back..."
        rollback
        fail "Smoke tests failed. Rolled back to $ROLLBACK_HASH"
    fi

    log "All smoke tests passed ✅"
}

# ============================================
# Rollback
# ============================================
rollback() {
    warn "Rolling back to $ROLLBACK_HASH..."
    cd "$DEPLOY_DIR"
    git checkout "$ROLLBACK_HASH"
    cd "$WEB_DIR"
    rm -rf .next
    NEXT_PUBLIC_API_URL="$API_DOMAIN" npm run build
    pm2 restart legacyshield-web
    warn "Rollback complete. Site restored to $ROLLBACK_HASH"
}

# ============================================
# Run it
# ============================================
log "Starting safe deploy at $(date)"
preflight
build
validate_build
deploy
smoke_test
log "🎉 Deploy complete and verified at $(date)"
log "Commit: $(cd $DEPLOY_DIR && git rev-parse --short HEAD)"
