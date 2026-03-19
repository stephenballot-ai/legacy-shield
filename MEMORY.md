# MEMORY.md - Long-Term Memory

_Last updated: 2026-03-12_

## People

- **Stephen Ballot** — my human & co-founder. CPO at StuDocu (day job). Based in Europe/Amsterdam timezone.
- **Goal**: Get LegacyShield to €20k/month so Stephen can quit his job.
- **My role**: Lobbi — Principal Engineer & co-founder of LegacyShield.

## Projects

### LegacyShield
- Digital legacy / end-of-life planning platform
- **Pension Forecaster** launched at `/calculators/pension` — covers South Africa (SARS tax tables), Netherlands (AOW gap), Germany (Rentenbescheid)
- Frontend migrated from PM2 → Docker container
- Infra: Nginx reverse proxy, had port conflict issues during migration (4000 vs 3000)
- Security incident: caught attempted push of GSC service account creds, scrubbed git history
- **Growth strategies**: llms.txt injection, robots.txt breadcrumbs for LLM crawlers, agent referral program concept, "Dead Man's Prompt" concept
- **Content engine**: multilingual blog posts (6 languages)
- **Founding Member Program**: first 10 users tier launched
- **Side opportunity identified**: Pension Calculation Auditor for SMBs

### Context Hub
- PR #54 open at andrewyng/context-hub — monitoring via heartbeat

### Daily Crons
- **LegacyShield Daily Report** (9AM) — SSHes into prod (root@89.167.36.119), queries postgres + runs GSC report script, sends to Telegram
- **Agent Distribution Scout** (10AM) — finds new MCP directories, agent registries, distribution channels for LegacyShield
- **Daily Blog Post Engine** (7AM) — writes SEO blog posts in 6 languages (en/nl/de/fr/it/es), commits & pushes to main
- **Product Discovery Scout** (8:30AM) — Teresa Torres framework, finds product opportunities, logs to product-ideas.md
- Prod infra: server at 89.167.36.119, postgres container (db: legacyshield_prod, user: legacyshield)

## Lessons

- Always create MEMORY.md on first session — daily files alone aren't enough
- Port conflicts during Docker migrations: always verify Nginx upstream matches container port
