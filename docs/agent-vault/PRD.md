# BitAtlas — Product Requirements Document

**Version:** 0.1 (Draft)
**Date:** 2026-03-15
**Authors:** Stephen Ballot, Lobbi (AI)
**Status:** RFC / Pre-seed

---

## 1. Vision

AI agents are becoming autonomous workers — they browse, code, negotiate, and make decisions. But they have no safe place to keep their stuff.

Today, agent memory is ephemeral. Files are dumped into S3 buckets readable by anyone with access keys. Sensitive data — medical records, financial documents, legal contracts — flows through agent pipelines with zero encryption guarantees. There is no standard for durable, encrypted, governed storage purpose-built for AI agents.

**BitAtlas** is the encrypted file system for AI agents. Zero-knowledge by default. MCP-native. Framework-agnostic. The agent stores it, the agent retrieves it — nobody else can read it. Not even us.

### Why Now

- **MCP adoption is accelerating.** Anthropic's Model Context Protocol is becoming the standard interface between AI agents and external tools. Storage is the most obvious missing primitive.
- **Enterprise agent adoption is blocked by security.** Companies won't deploy agents that handle sensitive data without encryption and audit trails. This is the unlock.
- **Agent frameworks are proliferating.** LangChain, CrewAI, AutoGen, custom builds — all need the same storage layer. Horizontal infrastructure beats vertical silos.
- **Regulation is coming.** The EU AI Act, GDPR enforcement on AI systems, and SOC2 requirements for AI tooling create demand for compliant-by-design storage.

---

## 2. Problem Statement

### For Agent Developers
> "I need my agent to remember things between sessions and store files securely, but I'm stitching together S3 + my own encryption + a metadata DB. It's fragile, insecure, and I rebuild it for every project."

### For Enterprises
> "We can't deploy agents that handle customer data without encryption at rest, audit trails, and access controls. Building this in-house takes months and distracts from our core product."

### For Framework Builders
> "We need a storage primitive our users can plug in. We don't want to build and maintain encrypted storage — we want to integrate with something that just works."

### The Gap

| Need | S3 / GCS | Mem0 | 1Password / Vault | **BitAtlas** |
|------|----------|------|-------------------|-----------------|
| Durable file storage | ✅ | ❌ (memory, not files) | ❌ (secrets, not files) | ✅ |
| Zero-knowledge encryption | ❌ | ❌ | ⚠️ (partial) | ✅ |
| Agent-native API | ❌ | ✅ | ❌ | ✅ |
| MCP-compatible | ❌ | ❌ | ❌ | ✅ |
| Cross-agent sharing | ❌ | ❌ | ❌ | ✅ |
| Audit trail | ⚠️ (CloudTrail) | ❌ | ✅ | ✅ |
| Framework agnostic | ✅ | ⚠️ | N/A | ✅ |

Nothing occupies this intersection today.

---

## 3. Target Users

### Primary: Agent Developers (Individual & Startup)

- Building agents with LangChain, CrewAI, AutoGen, or custom stacks
- Need persistent storage for agent state, documents, and artifacts
- Currently hacking together S3 + encryption or using no encryption at all
- **Willingness to pay:** $20–100/month for a solution that just works
- **Acquisition:** MCP marketplace, framework plugin registries, developer communities, HN/Reddit

### Secondary: Enterprises Building Agentic Workflows

- Deploying agents for customer service, legal, healthcare, finance
- Blocked by compliance requirements (GDPR, HIPAA, SOC2)
- Need audit trails, access controls, and provable zero-knowledge encryption
- **Willingness to pay:** $500–5,000/month per team
- **Acquisition:** Direct sales, partnerships with AI consultancies, compliance-driven inbound

### Tertiary: Framework & Platform Builders

- LangChain, CrewAI, AutoGen, and emerging frameworks
- Need a storage primitive to recommend/bundle for their users
- **Willingness to pay:** Revenue share or partnership model
- **Acquisition:** Direct partnership outreach, open-source contributions

---

## 4. Use Cases

### UC1: Agent Memory Persistence
An AI coding assistant stores project context, decisions, and learned preferences between sessions. Data is encrypted so even if the storage provider is compromised, no one can read the agent's accumulated knowledge.

### UC2: Secure Document Storage
A legal AI agent processes contracts, stores redlined versions, and retrieves them on demand. All documents are E2E encrypted. The law firm's compliance team can verify zero-knowledge properties.

### UC3: Cross-Agent Data Sharing
A research agent discovers and processes papers, storing summaries in BitAtlas. A writing agent — owned by the same user but running in a different framework — retrieves those summaries via a delegation token. The vault mediates access without either agent seeing the other's encryption keys directly.

### UC4: Audit Trail & Compliance
An enterprise healthcare agent stores patient interaction summaries. Every store, retrieve, and delete operation is logged with immutable audit entries. The compliance team can prove what was accessed, when, and by which agent — without being able to read the encrypted content.

### UC5: Agent Artifact Publishing
A data analysis agent stores generated reports and visualizations. The user can share a time-limited, decryptable link to a specific artifact with a colleague — without giving them access to the full vault.

### UC6: Multi-Agent Workflow State
A CrewAI crew of 5 agents uses BitAtlas as shared encrypted state. Each agent has scoped access to specific folders. The orchestrator agent has read access to all. State persists across crew executions.

---

## 5. Product Principles

### P1: Zero-Knowledge by Default
Encryption happens client-side before data reaches our servers. We never see plaintext. We can't comply with a subpoena for content because we literally can't read it. This is the product, not a feature.

### P2: Agent-Native APIs
APIs are designed for how agents work — tool calls, not file browsers. Store a blob, get it back, share it with another agent. No human UI required (though one exists for management).

### P3: MCP-First
The primary interface is an MCP server. Agents that speak MCP can use BitAtlas with zero custom integration. This is our distribution moat — as MCP grows, we grow.

### P4: Framework Agnostic
Works with LangChain, CrewAI, AutoGen, Mastra, custom agents, and frameworks that don't exist yet. No lock-in to any specific agent framework.

### P5: Boring Infrastructure
We're plumbing, not a feature. Reliable, fast, invisible. Agents shouldn't think about storage — it should just work. 99.9% uptime SLA from day one.

### P6: Privacy as Architecture
Privacy isn't a policy — it's a technical guarantee. Zero-knowledge encryption, minimal metadata collection, EU-hosted infrastructure. We architected away the ability to violate privacy.

---

## 6. MVP Scope (P0)

Ship the smallest thing that's useful and differentiated. Target: **8 weeks** from start.

### What Ships

1. **MCP Server** exposing `vault_store`, `vault_retrieve`, `vault_list`, `vault_delete` tools
2. **Client-side encryption** — AES-256-GCM with keys derived from user master key via HKDF
3. **REST API** as fallback for non-MCP agents
4. **API key authentication** — one key per user, scoped to their vault
5. **TypeScript SDK** with MCP client helper
6. **Python SDK** with MCP client helper
7. **Storage backend** — S3-compatible object storage (encrypted blobs) + PostgreSQL (encrypted metadata)
8. **Dashboard** — simple web UI to manage API keys, view storage usage, and see audit logs
9. **Free tier** — 100MB storage, 1,000 operations/month
10. **Documentation** — getting started guide, API reference, MCP integration guide

### What Doesn't Ship (Yet)

- Cross-agent sharing / delegation tokens (P1)
- Versioning (P1)
- File folders / namespaces (P1)
- Framework-specific adapters (P1)
- Enterprise SSO / team management (P2)
- Self-hosted option (P2)
- Compliance certifications (P2)

### MVP Success Criteria

- 100 developers sign up in first 30 days
- 20 convert to paid within 60 days
- <100ms p95 latency for store/retrieve operations
- Zero data breaches (obviously)

---

## 7. Feature Roadmap

### P0 — MVP (Weeks 1–8)
| Feature | Description |
|---------|-------------|
| MCP Server | Core vault tools: store, retrieve, list, delete |
| E2E Encryption | Client-side AES-256-GCM, HKDF key derivation |
| REST API | Full CRUD for non-MCP agents |
| Auth | API key per user |
| TypeScript SDK | npm package with MCP helper |
| Python SDK | PyPI package with MCP helper |
| Dashboard | Key management, usage stats, audit log viewer |
| Free Tier | 100MB, 1K ops/month |
| Docs | Getting started, API ref, MCP guide |

### P1 — Growth (Weeks 9–16)
| Feature | Description |
|---------|-------------|
| Delegation Tokens | Scoped, time-limited access tokens for cross-agent sharing |
| Versioning | Automatic version history with configurable retention |
| Namespaces | Folder-like organization within a vault |
| LangChain Adapter | Drop-in storage backend for LangChain agents |
| CrewAI Adapter | Shared state storage for CrewAI crews |
| Webhooks | Notify on store/retrieve/delete events |
| Tagging & Search | Metadata tags + encrypted search over tags |
| Team Billing | Multiple API keys under one billing account |

### P2 — Enterprise (Weeks 17–30)
| Feature | Description |
|---------|-------------|
| SSO / SAML | Enterprise identity provider integration |
| RBAC | Role-based access control within teams |
| Self-Hosted | Docker/Helm deployment for on-prem |
| SOC2 Type II | Compliance certification |
| HIPAA BAA | Healthcare compliance |
| AutoGen Adapter | Microsoft AutoGen integration |
| Mastra Adapter | Mastra framework integration |
| Custom Encryption | Bring-your-own KMS integration |
| SLA Tiers | 99.95% and 99.99% uptime options |
| Dedicated Infrastructure | Single-tenant deployment option |

---

## 8. Competitive Landscape

### Mem0 (mem0.ai)
- **What it is:** Memory layer for AI agents. Stores structured memories (facts, preferences), not files.
- **Overlap:** Both serve the "agent state persistence" use case.
- **Differentiation:** Mem0 is memory (key-value, semantic search). BitAtlas is files (blobs, documents, artifacts). Mem0 has no encryption guarantees. Different layers of the stack — complementary, not competitive.
- **Risk:** Mem0 could add file storage. But encryption is hard to bolt on after the fact.

### S3 / GCS / Azure Blob
- **What it is:** Generic object storage.
- **Overlap:** Both store files.
- **Differentiation:** No client-side encryption, no agent-native API, no MCP compatibility, no audit trails purpose-built for agents. Using S3 for agent storage is like using a filing cabinet for a database — technically possible, practically painful.
- **Risk:** Cloud providers could build agent-specific storage features. But they move slowly and won't do zero-knowledge (conflicts with their compliance/subpoena model).

### 1Password / HashiCorp Vault
- **What it is:** Secret management, not file storage.
- **Overlap:** Both involve "vaults" and encryption.
- **Differentiation:** Designed for secrets (API keys, passwords), not files. No MCP interface. No agent-native workflows. Different problem space.

### Pinecone / Weaviate / Vector DBs
- **What it is:** Vector storage for embeddings.
- **Overlap:** Both used by AI agents for persistence.
- **Differentiation:** Vector DBs store embeddings for retrieval. BitAtlas stores files and blobs with encryption. Complementary — an agent might use Pinecone for search and BitAtlas for secure document storage.

### Roll-Your-Own
- **What it is:** Every team building their own encryption + S3 + metadata layer.
- **This is our biggest competitor.** The answer is: stop rebuilding this. It's harder than you think, and you'll get the encryption wrong.

---

## 9. Pricing Model

### Free Tier
- 100 MB storage
- 1,000 operations/month
- 1 API key
- Community support
- **Purpose:** Developer adoption, proof of concept, hobby projects

### Pro — €29/month
- 10 GB storage
- 50,000 operations/month
- 5 API keys
- Delegation tokens
- Versioning (30-day retention)
- Email support
- **Purpose:** Individual developers, small projects

### Team — €99/month (+ €29/seat)
- 100 GB storage
- 500,000 operations/month
- Unlimited API keys
- Team management & RBAC
- 90-day version retention
- Webhook integrations
- Priority support
- **Purpose:** Startups, small teams

### Enterprise — Custom
- Unlimited storage
- Unlimited operations
- SSO / SAML
- Custom retention policies
- SLA guarantees (99.95%+)
- Dedicated infrastructure option
- Compliance packages (SOC2, HIPAA)
- Dedicated support engineer
- **Purpose:** Large organizations, regulated industries

### Revenue Model to €20K/Month

| Scenario | Free | Pro | Team | Enterprise | MRR |
|----------|------|-----|------|-----------|-----|
| Conservative (6 months) | 500 | 80 | 15 | 1 | €5,500 |
| Target (12 months) | 2,000 | 250 | 40 | 3 | €20,210 |
| Ambitious (12 months) | 5,000 | 500 | 80 | 5 | €38,420 |

The path to €20K/month: ~250 Pro + ~40 Team + a few Enterprise deals. Achievable with strong developer adoption and MCP marketplace distribution.

---

## 10. Success Metrics

### North Star
**Monthly Recurring Revenue (MRR)** — target €20K/month within 12 months.

### Leading Indicators

| Metric | 30 Days | 90 Days | 180 Days | 12 Months |
|--------|---------|---------|----------|-----------|
| Developer signups | 100 | 500 | 2,000 | 5,000+ |
| Free → Paid conversion | 5% | 8% | 10% | 12% |
| Monthly active vaults | 50 | 300 | 1,000 | 3,000+ |
| Operations/day | 1K | 10K | 100K | 500K+ |
| Data stored (TB) | 0.01 | 0.1 | 1 | 10+ |
| MRR | €500 | €3,000 | €8,000 | €20,000+ |

### Quality Metrics
- **p95 latency:** <100ms for store/retrieve
- **Uptime:** 99.9%
- **Security incidents:** 0
- **NPS:** >50

### Engagement Metrics
- **Weekly active developers:** >30% of signups
- **Ops per active vault/month:** >100 (indicates real integration, not tire-kicking)
- **SDK adoption split:** Track TS vs Python vs raw API to guide investment

---

## 11. Distribution Strategy

### Primary: MCP Marketplace
- List BitAtlas as the default encrypted storage MCP server
- First-mover advantage in a nascent ecosystem
- Every MCP-compatible agent is a potential user

### Secondary: Framework Plugin Registries
- Official LangChain integration (`langchain-bitatlas`)
- Official CrewAI integration
- Official AutoGen integration
- Appear where developers already look for storage solutions

### Tertiary: Developer Content
- "How to give your AI agent encrypted memory" (HN, dev.to, Medium)
- "Why your agent's data isn't as private as you think" (security angle)
- Conference talks at AI Engineer Summit, PyCon, etc.
- YouTube tutorials and live coding sessions

### Partnership: AI Consultancies & System Integrators
- Partner with firms building enterprise agent deployments
- They recommend BitAtlas as the storage layer
- Revenue share or referral fees

---

## 12. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | **Product name** | **BitAtlas** — confirmed. Domain: bitatlas.com (owned). |
| 2 | **Legal entity** | Spin off as separate company? Keep under LegacyShield BV? New Dutch BV or Delaware C-Corp for US investor appeal? |
| 3 | **LegacyShield migration** | When does LegacyShield move to BitAtlas as its storage backend? Before or after public launch? |
| 4 | **Open source vs proprietary** | Open-source the MCP server and SDKs, proprietary hosted backend? Or full open-source with hosted offering (GitLab model)? |
| 5 | **Hosting region** | EU-only initially (GDPR advantage)? Or multi-region from day one? |
| 6 | **Encryption key custody** | Pure zero-knowledge (user holds all keys) vs. optional managed keys for teams that want recovery? |
| 7 | **MCP spec evolution** | MCP is early. How do we handle breaking changes? Version our MCP server? |
| 8 | **AI Act compliance** | Does an "AI agent storage provider" have obligations under the EU AI Act? Need legal review. |
| 9 | **Fundraising** | Bootstrap to €20K MRR, or raise a small pre-seed (€200-500K) to move faster? |
| 10 | **Co-founder** | Need a technical co-founder? Or can Stephen + Lobbi + contractors get to PMF? |

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MCP doesn't become the standard | Medium | High | REST API as fallback; framework adapters work without MCP |
| Cloud provider builds this | Low-Medium | High | Move fast, build community, zero-knowledge is hard to retrofit |
| Encryption bug compromises data | Low | Critical | Third-party security audit, bug bounty, conservative crypto choices |
| Slow developer adoption | Medium | High | Free tier, excellent DX, content marketing, framework partnerships |
| LegacyShield migration breaks things | Medium | Medium | Migrate gradually, maintain backward compatibility, feature-flag |
| Enterprise sales cycle too long | High | Medium | Focus on self-serve developer adoption first, enterprise follows |
| Regulatory requirements unclear | Medium | Medium | Start conservative (EU-hosted, GDPR-compliant), get legal counsel early |

---

## Appendix A: Glossary

- **BitAtlas**: Working name for the encrypted storage platform
- **MCP**: Model Context Protocol — Anthropic's standard for AI agent tool integration
- **Zero-knowledge**: Architecture where the service provider cannot read stored data
- **E2E encryption**: End-to-end encryption — data is encrypted on the client before transmission
- **Delegation token**: A scoped, time-limited token allowing one agent to access another agent's data
- **HKDF**: HMAC-based Key Derivation Function — derives encryption keys from a master secret

---

*This is a living document. Last updated 2026-03-15.*
