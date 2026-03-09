# Product Ideas — Continuous Discovery Log

## Discovery Log

| # | Date | Name | Source | Fit | Status |
|---|------|------|--------|-----|--------|
| 1 | 2026-03-09 | TermsWatch | HN + Trustpilot research | high | new |
| 2 | 2026-03-09 | PracticeText EU | Reddit r/smallbusiness | medium | new |

---

### 1. TermsWatch — SaaS Terms of Service Change Monitor
**Source:** HN front page (US Court of Appeals ruling: TOS updated by email, use implies consent, 2026-03-09) + general SaaS frustration from Trustpilot reviews
**Opportunity:** "When my SaaS vendors update their terms of service, I want to understand what changed and whether it affects my business, but I miss these email notifications, can't parse 30-page legal documents, and only find out when something goes wrong."
**Solutions:**
- A) **Web crawler + diff engine**: Monitor TOS/privacy policy URLs of major SaaS tools (Stripe, AWS, Slack, etc.), compute diffs, use LLM to summarize changes in plain English, email/Slack alert with "what changed" and "business impact" score. Dashboard shows version history.
- B) **Email-first approach**: Connect to your inbox, auto-detect TOS update emails from vendors, extract and summarize changes, flag clauses that affect data processing, liability, or pricing. Works with your existing email flow instead of crawling.
**TAM:** M (every B2B company uses 20-50 SaaS tools; DPOs, legal teams, procurement) | **Moat:** Persistent state (version history over time), real-time web crawling pipeline, email integration, regulatory mapping (GDPR Article 28 processor terms) | **Effort:** month | **Fit:** high
**Riskiest Assumption:** 🟢 Desirability — Do SMBs actually care enough about TOS changes to pay for monitoring, or is this only a problem for enterprises with legal teams?
**ChatGPT-proof?:** yes — ChatGPT can summarize a TOS if you paste it in, but it can't: (1) monitor hundreds of URLs for changes automatically, (2) maintain version history and diffs over time, (3) integrate with your email to catch update notifications, (4) alert you proactively. The value is in the persistent monitoring pipeline, not the summarization.
**Cheapest Test:** Landing page targeting DPOs and SaaS procurement managers. Post in r/gdpr, r/sysadmin, r/SaaS. "We monitor your vendors' TOS so you don't have to — get alerted when terms change." Measure signups. Also: DM 10 DPOs on LinkedIn asking "How do you currently track when your SaaS vendors change their terms?"
**Notes:** The US Court of Appeals ruling (2026-03-03) that TOS can be updated by email with use implying consent makes this more urgent — businesses can be bound by terms they never read. EU angle is strong: GDPR requires data processors to notify controllers of sub-processor changes (Article 28), and many SaaS vendors bury these in TOS updates. NIS2 directive also requires supply chain risk monitoring. Could position as compliance tool, not just convenience.

---

### 2. PracticeText EU — SMS Appointment System for EU Small Practices
**Source:** Reddit r/smallbusiness post (dental practice cut no-shows by ~50% switching to SMS, 2026-03-09)
**Opportunity:** "When I run a small healthcare/service practice in Europe, I want to confirm appointments via text message because patients don't answer calls, but EU-compliant SMS tools are US-focused, expensive, and don't handle GDPR consent properly."
**Solutions:**
- A) **Shared-number SMS platform for EU practices**: GDPR-compliant SMS appointment confirmations with shared team inbox, local EU numbers, automatic consent tracking, and 2-way messaging. Integrates with common EU practice management systems.
- B) **WhatsApp Business API wrapper**: Since WhatsApp dominates EU messaging (vs SMS in US), build appointment confirmations on WhatsApp Business API with template messages, automated reminders, and GDPR consent flows.
**TAM:** L (millions of small practices across EU) | **Moat:** EU telecom integrations (local numbers per country), GDPR consent management, WhatsApp Business API integration, practice management system connectors | **Effort:** quarter | **Fit:** medium
**Riskiest Assumption:** 🟡 Feasibility — Telecom integrations across multiple EU countries are complex and expensive. WhatsApp Business API has strict template approval processes.
**ChatGPT-proof?:** yes — Requires real-time SMS/WhatsApp API integration, persistent appointment state, telecom infrastructure, GDPR consent tracking. LLMs can't send texts.
**Cheapest Test:** Survey 20 EU dental/physio practices: "How do you confirm appointments? Would you pay €50/mo for SMS/WhatsApp confirmations with GDPR compliance built in?"
**Notes:** Verbatim from Reddit: "People TEXT BACK like immediately. 'yes I'll be there' or 'actually can we move to thursday' done. no phone tag, no voicemails, no follow-up calls. Our confirmation rate went from whatever it was before (bad) to actually usable." US-focused tools like Klara, Luma Health don't serve EU. WhatsApp angle could be the differentiator for EU market.
