# Product Ideas — Continuous Discovery Log

## Discovery Log

| # | Date | Name | Source | Fit | Status |
|---|------|------|--------|-----|--------|
| 1 | 2026-03-09 | TermsWatch | HN + Trustpilot research | high | new |
| 2 | 2026-03-09 | PracticeText EU | Reddit r/smallbusiness | medium | new |
| 3 | 2026-03-10 | PensionCheck | Trustpilot (Sage) | high | new |
| 4 | 2026-03-10 | ExitVault | Reddit r/smallbusiness | medium | new |
| 5 | 2026-03-11 | TaxAudit Pro | Trustpilot (Taxfix) | high | new |
| 6 | 2026-03-11 | StorageSwitch | Trustpilot (pCloud/Google) | medium | new |
| 7 | 2026-03-13 | TaxMatch | Trustpilot (Taxfix) | high | new |
| 8 | 2026-03-13 | NexusGuard | Trustpilot (TaxJar/TaxCloud) | high | new |
| 9 | 2026-03-14 | AuditAlly | Trustpilot (Taxfix/N26) | high | new |
| 10 | 2026-03-14 | VaultMigrate | Trustpilot (1Password) | medium | new |
| 11 | 2026-03-15 | BescheidDelta | Trustpilot (Taxfix) | high | new |
| 12 | 2026-03-15 | SEPA-Lock Guard | Trustpilot (N26/Proton) | high | new |
| 13 | 2026-03-16 | BonusCalc Auditor | Trustpilot (Gusto) | high | new |
| 14 | 2026-03-16 | LegacySync | Trustpilot (1Password) | high | new |
| 15 | 2026-03-17 | Bescheid-Delta | Trustpilot (Taxfix.de) | high | new |
| 16 | 2026-03-17 | Rent Bridge | Trustpilot (Buildium) | medium | new |
| 17 | 2026-03-18 | Nexus Navigator | Trustpilot (TaxJar/Wise) | high | new |
| 18 | 2026-03-18 | CardGuard | Trustpilot (Wise) | high | new |
| 19 | 2026-03-19 | Spotlight Sync Pro | Trustpilot (pCloud) | medium | new |
| 20 | 2026-03-19 | AuditTrail EU | Trustpilot (Taxfix/Gusto) | high | new |
| 21 | 2026-03-19 | CivicAgent API | User Request | high | new |

---

### 21. CivicAgent API — Unified Agentic Wrapper for US State Services
**Source:** User Request (Stephen, 2026-03-19)
**Opportunity:** "When I need to interact with my state government (DMV, Secretary of State, Professional Licensing), I have to navigate dozens of different, outdated websites with zero API access, making it impossible for my AI agent to handle these tasks for me."
**Solutions:**
- A) **State-as-an-API**: A unified, horizontal API layer that wraps existing state websites using browser automation (Playwright/LLM). It translates structured API calls into "agentic actions" (e.g., `POST /de/sos/annual-report`).
- B) **Civic MCP Server**: A set of Model Context Protocol (MCP) servers that give AI agents direct tools to read and write to state government systems securely on behalf of the user.
**TAM:** XL (Every US adult and business owner) | **Moat:** The massive "Mapping Library" of thousands of diverse state-level UI flows and a high-trust security architecture for handling citizen credentials (Plaid-style). | **Effort:** high (requires continuous maintenance of fragile UI mappings) | **Fit:** high
**Riskiest Assumption:** 🔴 Legal/Regulatory — Will states block "agentic" traffic even if user-authorized? (Path: "Agent of Record" legal status).
**ChatGPT-proof?:** yes — Requires real-time UI navigation, session management, and handling of government-specific authentication (2FA/SSO).
**Cheapest Test:** "The Delaware Annual Report Bot." An API/Tool that does only one thing: files the mandatory Delaware Annual Report for startups (high willingness to pay, structured data).
**Notes:** Exclude IRS for now to avoid federal tax complexity. Focus on the "50-state mess" where the complexity moat is highest.


### 19. Spotlight Sync Pro — Native Cloud Search Wrapper for Mac
**Source:** Trustpilot (pCloud reviews, 2026-03-19)
**Opportunity:** "When I use non-Apple cloud storage (pCloud, Icedrive) on my Mac, I want to search for files and their content using Spotlight, but the virtual drive integration is so poor that Spotlight can't index the files, and the app's built-in search is slow and non-native."
**Solutions:**
- A) **CloudIndex Kernel Extension**: A low-level utility that maps virtual cloud drives (pCloud, etc.) into the macOS Spotlight indexing service, allowing full-text content search natively in Finder.
- B) **Unified Cloud Searcher**: A Raycast/Alfred-style global search bar that specifically indexes metadata and content from non-native cloud providers via their APIs, providing an "instant" Spotlight-like experience without needing to wait for the official apps to fix their integration.
**TAM:** M (Millions of Mac users choosing privacy-focused/lifetime cloud storage over iCloud) | **Moat:** Deep macOS file system integration (FUSE/FileProvider), proprietary indexing engine for cloud metadata, and a niche "better than the original" utility brand. | **Effort:** quarter | **Fit:** medium
**Riskiest Assumption:** 🟡 Feasibility — Can we maintain Spotlight compatibility across macOS updates without a dedicated team for kernel/extension maintenance?
**ChatGPT-proof?:** yes — Requires low-level system integration, real-time file system monitoring, and hardware-specific optimization.
**Cheapest Test:** "Spotlight for pCloud" landing page. Offer a simple script or utility that "forces" indexing for a $10 fee. See how many people click.
**Notes:** Review quote: "Spotlight can't search within the pCloud folder so finding your files is difficult... The integration on Mac OS is terrible."

---

### 20. AuditTrail EU — The "Why Is My Money Different?" Auditor
**Source:** Trustpilot (Taxfix/Gusto reviews, 2026-03-19)
**Opportunity:** "When I receive a final financial outcome (Tax refund, Bonus payroll, Insurance payout) that is significantly lower than the software estimate, I want to know the exact technical reason for the discrepancy, but the provider offers no 'diff' or post-event audit trail, leaving me to guess if I made a mistake or the tax office/employer did."
**Solutions:**
- A) **Financial Delta Engine**: A "read-only" auditor that allows users to upload their "Submission Data" (what they sent) and the "Result Document" (what they got back). The tool runs a comparison and generates a human-readable "Discrepancy Report" (e.g., "The Finanzamt rejected your Home Office deduction because of [Code 402]").
- B) **Shadow Filing Monitor**: A subscription service that monitors your official government accounts (Elster, HMRC, IRS) and automatically compares official records against your "Golden Copy" of submissions to flag errors in real-time.
**TAM:** L/XL (Taxpayers, employees, and insurance claimants globally) | **Moat:** Multi-sector document parsers (Tax letters, Payroll stubs, Insurance EOBs), deep regulatory ruleset database, and high-trust status. | **Effort:** month | **Fit:** high
**Riskiest Assumption:** 🔴 Usability — Can the OCR and logic engine accurately identify the specific reason for a rejection from a semi-structured PDF?
**ChatGPT-proof?:** yes — Requires official API connectivity (Elster/Gusto), structured data comparison, and persistent state of the user's legal/financial cases.
**Cheapest Test:** "The Taxfix/Gusto Discrepancy Checker." Offer a free report to the next 50 people on Reddit complaining about lower-than-expected refunds. Manually audit the PDFs to build the rule engine.
**Notes:** This is the ultimate "pain point" aggregator for Taxfix, Gusto, and Wise users. Review quote: "Taxfix said I am eligible for aprox 2500 €, but in actual I got only 1053€ . I dont understand why this much difference happened ??"

