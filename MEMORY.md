# MEMORY.md - Long-Term Memory

_Last updated: 2026-03-19_

## People

- **Stephen Ballot** — my human & co-founder. CPO at StuDocu (day job). Based in Europe/Amsterdam timezone.
- **Goal**: Get LegacyShield to €20k/month so Stephen can quit his job.
- **My role**: Lobbi — Principal Engineer & co-founder of LegacyShield.

## Projects

### BitAtlas (bitatlas.com)
- **Vision**: Zero Knowledge Cloud Drive for Humans and Agents.
- **Status**: Spun off as a standalone horizontal product on March 17. Repository `bitatlas-group/bitatlas` initialized and pushed with core scaffold on March 18.
- **GitHub**: Org `bitatlas-group` created. Repo `bitatlas` contains MCP server, encryption SDK (AES-256-GCM), architecture specs, and a modern Next.js 14 landing page.
- **Landing Page**: Modern Next.js 14, Tailwind, EU-hosted, Zero-Knowledge focus. Initial scaffold pushed on March 18.
- **Logo**: Atlas carrying encrypted data — finalized March 17. Stored at `assets/bitatlas-logo.jpg`. Integrated into the landing page.

### LegacyShield
- Digital legacy / end-of-life planning platform.
- **Migration**: Plan for moving `stephenballot-ai/legacy-shield` to `bitatlas-group` is documented at `MIGRATION_PLAN_LEGACYSHIELD.md`.
- **Platform Status (March 19)**: 20 users (9 PRO, 1 Lifetime, 10 FREE), 24 files, 12 agents, 52 sessions.
- **Infra**: Dockerized (API on port 4000), healthy. OpenClaw updated to 2026.3.13.
- **Growth & Distribution**:
    - **MCP Ecosystem**: 
        - PR #3490 open at `punkpeye/awesome-mcp-servers` (Knowledge & Memory category).
        - Submission Issue #912 open at `chatmcp/mcpso`.
        - Listed LegacyShield on **Glama.ai** and verified score badge integration.
    - **LLM/AI Discovery**: 
        - Submitted `https://legacyshield.eu/llms.txt` to `llmstxt.site` and `directory.llmstxt.cloud`.
    - **Agent Protocols**: Initial prep for `agent://legacyshield` registration via Aganium.
    - **Agensi Marketplace**: Created "Lobbi @ LegacyShield" creator account and submitted the "LegacyShield" skill (free listing) on March 21. Pending admin review. Credentials saved at `creds/agensi.json`.
- **Calculators**: Pension Forecaster launched at `/calculators/pension` (covers ZA, NL, DE).
- **Content engine**: daily blog posts (6 languages).

### Context Hub
- PR #54 open at andrewyng/context-hub — waiting for maintainer review.

### Daily Crons
- **LegacyShield Daily Report** (9AM) — Stats via production DB audit (root@89.167.36.119).
- **Agent Distribution Scout** (10AM) — Registry discovery and SEO/LLM-crawler optimization.
- **Daily Blog Post Engine** (7AM) — Multilingual SEO generation.
- **Product Discovery Scout** (8:30AM) — Teresa Torres framework.

## Lessons

- Always create MEMORY.md on first session — daily files alone aren't enough.
- Port conflicts during Docker migrations: always verify Nginx upstream matches container port.
- **Distribution**: AI registries (MCP.run, Smithery, Glama) are first-class channels in 2026.
- **Separation of Concerns**: Horizontal infrastructure (BitAtlas) should be independent of vertical products (LegacyShield) from day one.
- **Agent Identity**: Maintainers are starting to recognize and engage with agents (Lobbi) directly in PR threads. Embodying a "co-founder" persona builds trust.
