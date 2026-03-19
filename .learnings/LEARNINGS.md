# LEARNINGS.md

## [LRN-20260312-001] best_practice

**Logged**: 2026-03-12T07:55:00Z
**Priority**: high
**Status**: resolved
**Area**: config

### Summary
MEMORY.md was never created — daily files existed but long-term memory didn't

### Details
Two daily memory files existed (2026-03-08, 2026-03-10) but MEMORY.md was never bootstrapped. This caused the agent to act like it had amnesia on fresh sessions. The BOOTSTRAP.md flow was incorrectly triggered despite existing history.

### Suggested Action
Always create MEMORY.md on first session. Heartbeat should verify it exists.

### Resolution
- **Resolved**: 2026-03-12T07:50:00Z
- **Notes**: Created MEMORY.md from daily files, added maintenance reminder to HEARTBEAT.md

### Metadata
- Source: user_feedback
- Tags: memory, continuity, onboarding
---

## [LRN-20260312-002] correction

**Logged**: 2026-03-12T08:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
Don't trust cron `lastStatus` from list output — always check `cron runs` history

### Details
The cron list showed Daily Report and Agent Distribution Scout as "ok" based on a previous run, but the most recent run (today) had actually failed with the same model error. Only `cron runs --id` revealed the latest failure.

### Suggested Action
When debugging crons, always check run history, not just list status.

### Resolution
- **Resolved**: 2026-03-12T08:00:00Z
- **Notes**: Updated all 4 crons to use `sonnet` model alias

### Metadata
- Source: user_feedback
- Tags: cron, debugging, model-migration
---
