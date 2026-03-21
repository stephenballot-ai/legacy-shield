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
| 22 | 2026-03-20 | Audit-the-Audit | Trustpilot (Taxfix/Gusto) | high | new |
| 23 | 2026-03-20 | Rent-ACH Bridge | Trustpilot (Buildium) | medium | new |
| 24 | 2026-03-21 | Spotlight CloudIndex | Trustpilot (pCloud) | high | new |
| 25 | 2026-03-21 | MoveReady ISP | Trustpilot (Proximus/Belgian ISPs) | high | new |

---

### 24. Spotlight CloudIndex — Native macOS Indexing for Third-Party Cloud Drives
**Source:** Trustpilot (pCloud reviews, 2026-03-21)
**Opportunity:** "When I use non-Apple cloud storage (pCloud, Icedrive, Proton Drive) on my Mac, I want to search for files and their content using Spotlight, but the virtual drive integration is so poor that Spotlight can't index the files, making it nearly impossible to find specific documents without opening the clunky app UI."
**Solutions:**
- A) **CloudIndex Extension**: A lightweight macOS utility that uses the `FileProvider` API to expose virtual drive metadata and content specifically to the `mds` (Metadata Server) for Spotlight indexing.
- B) **Native Search Proxy**: A global search bar (Raycast/Alfred style) that indexes the cloud drive locally via the provider's API, providing an "instant" Spotlight-like experience without needing to wait for the official apps to fix their integration.
**TAM:** M (Millions of privacy-conscious Mac users opting for lifetime or EU-based storage over iCloud/Google Drive) | **Moat:** Deep macOS system integration (FileProvider/FUSE), proprietary indexing optimization for low-bandwidth cloud metadata, and a "better than original" utility brand. | **Effort:** month | **Fit:** high
**Riskiest Assumption:** 🟡 Feasibility — Can we reliably force the `mds` to index content that the primary app (e.g., pCloud) is actively hiding or failing to provide via the FileProvider?
**ChatGPT-proof?:** yes — Requires low-level macOS system programming, real-time file system monitoring, and hardware-specific optimization.
**Cheapest Test:** Create a "Spotlight for pCloud" landing page. Offer a simple CLI tool that "forces" a re-index of the pCloud volume. See how many people click the "Get the App" button for a $19 one-time purchase.
**Notes:** Review quote: "Spotlight can't search within the pCloud folder so finding your files is difficult... The integration on Mac OS is terrible."

### 25. MoveReady ISP — The "Pre-Vetted" Internet Setup for Expats
**Source:** Trustpilot (Proximus/Belgian ISPs, 2026-03-21)
**Opportunity:** "When I move to a new apartment in a new country (like Belgium), I want to know exactly which ISP will provide the best speed and reliability *at my specific address* before I sign a 12-month contract, but I'm forced to guess based on marketing claims and then pay €60+ installation fees for 15% of the promised speed."
**Solutions:**
- A) **Address-Level ISP Audit**: A service that uses crowdsourced speed tests and technician-level data to provide a "Connectivity Score" for a specific street number. It includes a "Concierge Onboarding" that handles the installation and ensures the promised speed is met (or it handles the cancellation).
- B) **ISP Bridge-as-a-Service**: A portable, high-speed 5G backup router that expats can rent for €20 for the first month while the ISP "technician wait" occurs, which then seamlessly transitions to the hardline once stable.
**TAM:** M (High-churn expat populations in cities like Brussels, Amsterdam, Berlin) | **Moat:** Proprietary address-level speed database (more granular than general ISP maps) and a "Concierge" trust layer that handles the high-friction local language bureaucracy. | **Effort:** weekend (for MVP/Agency) / quarter (for Platform) | **Fit:** high
**Riskiest Assumption:** 🔵 Viability — Will users pay €29-49 for a "Connectivity Report" and "Hassle-Free Setup" when they could technically do it themselves for free (but with high stress)?
**ChatGPT-proof?:** yes — Requires real-time local data, physical hardware (for 5G bridge), and human-in-the-loop coordination with local utilities.
**Cheapest Test:** A landing page targeting "Moving to Brussels?" Google Ads. Offer a "Best ISP for your Street" report for €10. Manually check the availability maps and local Reddit threads to provide the answer.
**Notes:** Review quote: "Moved to Brussels... had to pay 60€ again for the move... I now had a 15 Mbps connection for a whopping 50€/month... edpnet seems to have good reviews... Scarlet is basically Proximus but cheaper."


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


### 22. Audit-the-Audit — The Automated Tax & Payroll Post-Mortem
**Source:** Trustpilot (Taxfix/Gusto/Buildium, 2026-03-20)
**Opportunity:** "When I receive a final financial result (tax refund, payroll bonus, or insurance payout) that is significantly lower than the software estimate, I want to understand the exact technical reason for the discrepancy, but the provider offers no line-by-line 'diff', leaving me to guess if the error was mine, theirs, or the government's."
**Solutions:**
- A) **Delta Auditor (SaaS)**: A tool where users upload their "Submission Protocol" (PDF from Taxfix/Gusto) and their "Assessment Letter" (PDF from Finanzamt/IRS). The system parses both, performs a line-item comparison, and highlights exactly where the deduction was rejected or the rate changed.
- B) **Discrepancy API for Fintechs**: A B2B API that consumer tax/payroll apps can integrate to automatically explain "Estimation vs. Reality" gaps to their users, reducing support tickets.
**TAM:** L/XL (Millions of taxpayers and employees globally) | **Moat:** Proprietary OCR and mapping logic that links human-readable tax software fields to cryptic government rejection codes (e.g., "Anlage N, Line 42"). | **Effort:** month | **Fit:** high
**Riskiest Assumption:** 🟢 Usability — Can the parser handle the high variance in government PDF formats and languages (e.g., German Finanzamt letters)?
**ChatGPT-proof?:** yes — Requires secure document handling, specialized parsing rules for financial documents, and integration with user-specific submission history.
**Cheapest Test:** Create a "Finanzamt Letter Decoder" landing page. Offer to manually audit the first 20 letters for free in exchange for data. Use findings to build the rule engine.
**Notes:** Review quote: "The initially filed amount of refund was much higher than the amount finally approved... Taxfix does not provide any follow up what was accepted and what was not... I would appreciate to be able to understand the reasons."

### 23. Rent-ACH Bridge — Rapid Onboarding for Property Managers
**Source:** Trustpilot (Buildium, 2026-03-20)
**Opportunity:** "When I switch property management software, I want my tenants to start paying online immediately, but the ACH/ePay approval process takes 10-14 days and has strict limits, forcing me to handle manual checks for the first month and creating a cash-flow delay."
**Solutions:**
- A) **Instant-Pay Wrapper**: A standalone payment gateway for landlords that uses Plaid/Stripe to bypass legacy software onboarding delays. It syncs the successful payments back into Buildium/AppFolio via API or CSV import.
- B) **Pre-Vetted Landlord "Credit Score"**: A portable risk profile for property managers that they can use to fast-track ePay approvals across different platforms.
**TAM:** M (Thousands of PMs switching software or onboarding new portfolios monthly) | **Moat:** High-trust financial integration (Plaid/Stripe) combined with niche software connectors (Buildium/AppFolio APIs). | **Effort:** quarter | **Fit:** medium
**Riskiest Assumption:** 🔵 Viability — Will landlords pay a premium for "instant" onboarding if the alternative is just waiting 2 weeks once? (Test for high-growth PMs).
**ChatGPT-proof?:** yes — Requires real-time banking integrations, KYC/AML compliance, and handling of financial transactions.
**Cheapest Test:** A "Buildium ACH Fast-Track" service. Offer a 24-hour setup guarantee via a custom Stripe integration for a one-time fee.
**Notes:** Review quote: "ACH (tenant payment) set-up is very delayed - takes every bit of 10 days to get approved... the limit they granted me was so low that I had tenants unable to pay their rents."
