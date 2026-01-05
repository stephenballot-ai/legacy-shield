# Legacy Shield - Product Specification

**Version:** 1.0
**Last Updated:** January 5, 2026
**Authors:** Product Team

---

## 1. Executive Summary

### 1.1 Vision
Legacy Shield is a secure digital vault designed exclusively for critical life documents. Unlike general cloud storage solutions, Legacy Shield focuses on the small subset of documents that matter most: the files you need for important life transactions and the documents your loved ones would need to access in an emergency.

### 1.2 Core Value Proposition
- **Day-to-day convenience**: Instant access to critical documents (passport, insurance cards, property deeds) anywhere, anytime
- **Emergency preparedness**: Loved ones can access essential documents if you're incapacitated or deceased
- **Peace of mind**: Military-grade encryption with zero-knowledge architecture means your most sensitive documents are maximally secure
- **European data sovereignty**: Your data never leaves European soil, hosted exclusively on EU infrastructure for maximum privacy

### 1.3 Key Differentiators
1. **Intentional limitations**: Document count limits force users to store only what's truly critical
2. **Dual access model**: Owner has full control; emergency contacts get read-only access via unlock phrase
3. **Zero-knowledge encryption**: We never see your documents in plaintext
4. **Emergency-first design**: Built specifically for estate planning and crisis scenarios, not just storage
5. **European-only hosting**: Data stored exclusively on European servers (GDPR-native, no US jurisdiction)

---

## 2. Target Market

### 2.1 Primary Target Audience
**Middle-aged adults (40-60 years old) in North America and Europe**

Characteristics:
- Starting estate planning or have aging parents
- Own property and have accumulated financial assets
- Have families or loved ones they want to protect
- Digitally savvy but value simplicity and privacy
- Willing to pay for peace of mind and security
- Have experienced or witnessed the chaos of disorganized estate management
- Privacy-conscious (especially in post-GDPR era)

### 2.2 User Personas

#### Persona 1: Sarah, 52, Marketing Director (Boston, USA)
- **Scenario**: Recently helped her mother after her father passed away; spent weeks searching for insurance policies, account numbers, and the will
- **Pain point**: Never wants her kids to go through that
- **Motivation**: Organization and protecting her family from future stress
- **Privacy concern**: Wants her sensitive documents on EU servers, away from US data surveillance
- **Use case**: Stores estate documents, property deeds, insurance policies; gave unlock phrase to her sister and adult daughter

#### Persona 2: Michael, 47, Software Engineer (Munich, Germany)
- **Scenario**: Travels frequently for work; tired of scrambling for passport copies, insurance cards, and documents
- **Pain point**: Needs instant access to critical documents while traveling
- **Motivation**: Convenience and digital organization
- **Privacy concern**: GDPR-conscious, doesn't trust US cloud providers with sensitive documents
- **Use case**: Daily access to passport, insurance, vaccination records; emergency access for spouse

#### Persona 3: Elena, 55, Small Business Owner (Amsterdam, Netherlands)
- **Scenario**: Manages multiple properties and investments; recently divorced
- **Pain point**: Scattered documents across physical files, email, and old USBs
- **Motivation**: Consolidation and control; wants adult children to have access if needed
- **Privacy concern**: Prefers European data residency for financial documents
- **Use case**: Property documents, divorce decree, business ownership papers, updated will

---

## 3. Product Features

### 3.1 Core Features (MVP)

#### 3.1.1 Document Management
- **Upload**: Drag-and-drop or file picker; supports PDF, images (JPG, PNG, HEIC), Office docs
- **View**: In-browser document viewer (no download required for quick checks)
  - PDF viewer with zoom, page navigation
  - Image viewer for ID cards, insurance cards
  - Preview for Office documents
- **Download**: One-click encrypted download
- **Organize**: Tag documents by category (Identity, Property, Financial, Insurance, Medical, Legal, Travel, Family, Digital Assets)
- **Search**: Search by filename and tags
- **Delete**: Permanent deletion with confirmation (owner only)

#### 3.1.2 Security & Encryption
- **Client-side encryption**: All encryption/decryption happens in browser
- **Zero-knowledge architecture**: Server never sees plaintext documents or encryption keys
- **Master password**: User-chosen password derives master encryption key
- **Per-file encryption**: Each document gets unique encryption key
- **Secure upload**: Encrypted before transmission

#### 3.1.3 Emergency Access System
- **Unlock phrase setup**: Owner creates memorable phrase (not stored on servers)
- **Dual-key encryption**: Each file encrypted with both owner key and emergency key
- **Emergency contact designation**: Assign up to 1 (free) or 5 (paid) emergency contacts
- **Read-only access**: Emergency contacts can view and download, but never delete or modify
- **Emergency access URL**: Special portal for emergency contacts (`/emergency-access`)
- **Access audit log**: Track when emergency contacts access documents

#### 3.1.4 Account Management
- **Registration**: Email + master password
- **Two-factor authentication (2FA)**: Mandatory for all users
- **Recovery codes**: Generated during signup for account recovery
- **Session management**: Secure sessions, auto-logout after inactivity
- **Master password change**: Re-encrypts all file keys with new master key

### 3.2 Premium Features

#### 3.2.1 Document Organization
- **Favorites**: Quick-access pinning for frequently needed docs
- **Emergency priority flagging**: Mark documents as high-priority for emergency contacts
- **Document relationships**: Link related documents (e.g., insurance policy + insurance card)
- **Expiration tracking**: Set expiration dates with email reminders (passport renewal, insurance renewal)

#### 3.2.2 Sharing & Collaboration
- **Temporary sharing**: Generate time-limited secure links for sharing single documents (e.g., with accountant, lawyer)
- **Share history**: Audit trail of all shares

#### 3.2.3 Enhanced Security
- **Security audit log**: Complete history of all access (login, uploads, downloads, shares)
- **Trusted device management**: Require approval for new devices
- **Login notifications**: Email alerts for new logins

---

## 4. Document Taxonomy

Legacy Shield supports the following document categories:

### 4.1 Identity & Vital Records (Critical)
- Passport
- National ID card / Driver's License
- Birth certificate
- Social Security card / National Insurance number
- Marriage certificate / Civil partnership
- Divorce decree
- Citizenship papers
- Death certificates (for estate management)

### 4.2 Property & Assets (Critical)
- Property deeds
- Mortgage documents
- Vehicle titles and registration
- Safe deposit box information

### 4.3 Financial Accounts (Critical for emergency access)
- Bank account information
- Investment account statements
- Retirement accounts (401k, IRA, pension)
- Cryptocurrency wallet keys and recovery phrases
- Loan documents
- Stock/bond certificates

### 4.4 Insurance Policies (Critical)
- Health insurance cards
- Life insurance policies
- Home/renters insurance
- Auto insurance
- Disability insurance
- Long-term care insurance

### 4.5 Medical & Healthcare (Critical for emergencies)
- Medical history
- Vaccination records
- Current prescriptions
- Healthcare directives / Living Will
- Do Not Resuscitate (DNR) orders
- Organ donor registration
- Medical Power of Attorney

### 4.6 Legal & Estate Planning (Most critical for death scenarios)
- Last Will and Testament
- Trust documents
- Power of Attorney (financial and healthcare)
- Beneficiary designations
- Funeral and burial wishes
- Executor/trustee contact information

### 4.7 Tax Records
- Tax returns (last 7 years)
- W-2s / 1099s
- Property tax records

### 4.8 Travel Documents
- Passport copies
- Visa documents
- Global Entry / TSA PreCheck
- Vaccination certificates

### 4.9 Family Documents
- Children's birth certificates
- Children's passports and IDs
- Custody agreements
- Adoption papers
- Pet vaccination records

### 4.10 Digital Assets (Increasingly critical)
- Password vault recovery codes
- Cryptocurrency wallet information
- Domain name registrations
- Social media account information (for memorial/deletion)
- Subscription lists

---

## 5. Pricing & Business Model

### 5.1 Pricing Tiers

#### Free Tier
**Purpose:** Proof of concept, viral adoption
**Limits:**
- 15 critical documents
- 1 emergency contact
- 5MB per document
- Basic document viewer
- Email support

**Target user:** Someone wanting to try the concept with their most essential documents (passport, will, insurance, deed, bank info)

#### Legacy Shield Pro
**Price:** $500 (lifetime) OR $10/month
**Limits:**
- 100 critical documents
- 5 emergency contacts
- 10MB per document (1GB total max)
- Advanced features (expiration tracking, sharing, priority flagging)
- Audit log access
- Priority email support
- European data residency guarantee

**Target user:** Serious users ready to organize all critical documents and set up comprehensive emergency access

### 5.2 Revenue Model
- **Primary revenue**: Lifetime purchases ($500) and monthly subscriptions ($10/month)
- **Break-even point**: 50 months (~4 years) for lifetime customers
- **Target conversion rate**: 10-15% of free users upgrade to Pro
- **Average customer lifetime value**: $500 (lifetime) or $120/year (monthly)

### 5.3 Unit Economics
**Per-user costs (monthly):**
- Storage (100MB average): $0.003 (Hetzner Object Storage)
- Database (PostgreSQL): $0.015
- Bandwidth: $0.008
- Infrastructure overhead: $0.015
- **Total cost per user per month: ~$0.04**

**Margins:**
- Monthly subscriber: $10 revenue - $0.04 cost = **99.6% gross margin**
- Lifetime subscriber (amortized over 4 years): $10.42/month - $0.04 = **99.6% gross margin**

---

## 6. User Flows

### 6.1 New User Onboarding Flow

```
1. Landing page → Sign up
   ↳ Prominent: "Your data stays in Europe. Always."
2. Email + Master password creation
   ↳ Password strength requirements displayed
   ↳ Warning: "If you forget this password, we cannot recover your documents"
3. Enable 2FA (mandatory)
   ↳ Authenticator app or SMS
4. Recovery codes generation
   ↳ Download and save codes
   ↳ Confirmation: "I have saved my recovery codes"
5. Welcome tour (optional skip)
   ↳ "Upload your first document"
   ↳ "Create an unlock phrase"
   ↳ "Add an emergency contact"
6. Upload first document
   ↳ Category selection
   ↳ Progress indicator
   ↳ Success: "Your document is encrypted and secure on EU servers"
7. Free tier: Prompt to set up emergency access
   ↳ "You have 1 emergency contact slot available"
```

### 6.2 Daily Use Flow (Document Access)

```
1. Login (email + password + 2FA)
2. Dashboard view
   ↳ Recent documents
   ↳ Favorites
   ↳ Documents expiring soon
3. Search or browse by category
4. Click document to view
   ↳ In-browser viewer loads
   ↳ Decryption happens client-side
   ↳ Document renders (PDF, image, etc.)
5. Options: Download, Share, Delete, Edit metadata
```

### 6.3 Emergency Access Setup Flow

```
1. Navigate to "Emergency Access" settings
2. Create unlock phrase
   ↳ Instructions: "Make it memorable but not guessable"
   ↳ Example: "Mom's maiden name + year we moved to Boston"
   ↳ Confirmation field
   ↳ Phrase derives emergency encryption key
   ↳ All file keys re-encrypted with emergency key
3. Add emergency contact
   ↳ Name, relationship, email (optional)
   ↳ Contact information (phone, address)
   ↳ Instructions for accessing vault
4. Print or save instructions
   ↳ Emergency access URL
   ↳ "Share the unlock phrase separately (in person, secure message)"
5. Test emergency access (optional)
   ↳ Open emergency portal
   ↳ Enter unlock phrase
   ↳ Verify access works
```

### 6.4 Emergency Contact Access Flow

```
1. Emergency contact receives information
   ↳ URL: legacyshield.com/emergency-access
   ↳ Unlock phrase (received separately)
2. Navigate to emergency access URL
3. Enter unlock phrase
   ↳ System derives emergency key
   ↳ Validates key against encrypted metadata
4. Emergency dashboard (read-only mode)
   ↳ All documents visible
   ↳ Documents flagged as "emergency priority" shown first
   ↳ No delete or edit options
   ↳ Audit log records access
5. View and download documents as needed
   ↳ In-browser viewing
   ↳ Download encrypted, decrypt client-side
6. Optional: Notify owner (if contact information available)
   ↳ "Emergency access was used on [date] by [contact]"
```

### 6.5 Upgrade Flow (Free to Pro)

```
1. Hit limit (15 documents or 1 emergency contact)
   ↳ Modal: "You've reached your limit"
   ↳ "Upgrade to Pro for 100 documents and 5 emergency contacts"
2. Pricing page
   ↳ Comparison: Free vs Pro
   ↳ Highlighted: "European data residency guarantee"
   ↳ Choice: $500 lifetime or $10/month
3. Payment
   ↳ Stripe checkout
   ↳ Lifetime: One-time payment
   ↳ Monthly: Recurring subscription
4. Instant upgrade
   ↳ Limits immediately increased
   ↳ Access to premium features
   ↳ Welcome email with premium features guide
```

---

## 7. Success Metrics

### 7.1 Acquisition Metrics
- **Website visitors** (monthly unique)
- **Sign-up conversion rate** (visitors → free accounts)
- **Activation rate** (free accounts that upload at least 1 document)

### 7.2 Engagement Metrics
- **Documents per user** (average)
- **Weekly active users** (WAU)
- **Monthly active users** (MAU)
- **Emergency contacts set up** (% of users)

### 7.3 Revenue Metrics
- **Free-to-paid conversion rate** (target: 10-15%)
- **Monthly Recurring Revenue (MRR)**
- **Lifetime purchase volume**
- **Average Revenue Per User (ARPU)**
- **Customer Acquisition Cost (CAC)**
- **Lifetime Value (LTV)**
- **LTV:CAC ratio** (target: 3:1 or better)

### 7.4 Retention Metrics
- **30-day retention** (% of new users active after 30 days)
- **90-day retention**
- **Churn rate** (monthly subscriptions)
- **Document upload frequency**

### 7.5 Success Targets (Year 1)
- 10,000 free users
- 1,000 paid users (10% conversion)
- $120,000 ARR (Annual Recurring Revenue)
- 70% 90-day retention
- <5% monthly churn

---

## 8. Product Roadmap

### 8.1 Phase 1 - MVP (Months 1-3)
**Goal:** Launch with core value proposition

Features:
- User registration, login, 2FA
- Client-side file encryption/decryption
- Upload, view, download, delete documents
- Basic document organization (categories, search)
- Emergency access setup (unlock phrase)
- Emergency contact portal (read-only access)
- Free tier (15 docs) and Pro tier ($10/month only initially)
- Basic security (HTTPS, encrypted storage, audit logs)
- European hosting on Hetzner

### 8.2 Phase 2 - Growth & Refinement (Months 4-6)
**Goal:** Improve UX, add premium features, introduce lifetime pricing

Features:
- Lifetime pricing option ($500)
- Expiration date tracking with email reminders
- Favorites and priority flagging
- Document relationships (linking)
- Improved onboarding flow
- Mobile-responsive design improvements
- Payment processing optimization
- European data residency badge/certification

### 8.3 Phase 3 - Scale & Advanced Features (Months 7-12)
**Goal:** Scale to thousands of users, add differentiated features

Features:
- Temporary secure sharing (time-limited links)
- Advanced audit logs
- Trusted device management
- Native mobile apps (iOS, Android with React Native)
- Multi-language support (German, French, Dutch, Spanish)
- Document templates (will template, power of attorney template)
- Bulk upload

### 8.4 Phase 4 - Enterprise & Partnerships (Year 2+)
**Goal:** B2B opportunities, strategic partnerships

Features:
- Family plan (shared vault for couples)
- Estate planning professional accounts (lawyers, financial advisors can help clients set up vaults)
- Integration with password managers (1Password, Bitwarden)
- Integration with estate planning services
- White-label offering for European financial institutions
- Compliance certifications (SOC 2, ISO 27001, GDPR certification seal)

---

## 9. Competitive Landscape

### 9.1 Direct Competitors
**None identified.** No existing product specifically targets critical document storage with emergency access as the primary use case.

### 9.2 Indirect Competitors

#### General Cloud Storage (Dropbox, Google Drive, iCloud)
- **Strengths**: Ubiquitous, large storage, familiar
- **Weaknesses**: Not designed for critical docs; no emergency access mechanism; cluttered with all files; security model not zero-knowledge; US-based (privacy concerns)
- **Our advantage**: Purpose-built for critical docs only; intentional limits; emergency access built-in; zero-knowledge encryption; European data residency

#### Password Managers (1Password, LastPass, Bitwarden)
- **Strengths**: Secure storage, good encryption, some support document storage
- **Weaknesses**: Document storage is secondary feature; limited file size; not designed for viewing large documents; emergency access varies by product
- **Our advantage**: Document-first design; better viewing experience; explicit emergency access model; family-friendly interface

#### Estate Planning Software (Trust & Will, Willing)
- **Strengths**: Comprehensive estate planning tools, legal guidance
- **Weaknesses**: Focus on will creation, not document storage; not for day-to-day document access; US-based
- **Our advantage**: Dual use case (daily + emergency); stores any critical documents, not just estate plans; simpler, more focused; European hosting

#### Physical Safe / Safe Deposit Box
- **Strengths**: Perceived security, physical control
- **Weaknesses**: Inconvenient for daily access; can be destroyed (fire, flood); hard for emergency contacts to access
- **Our advantage**: Accessible anywhere; backed up; instant emergency access; can't be destroyed in disaster

### 9.3 Positioning Statement
**For privacy-conscious middle-aged adults who want to protect their families from future stress, Legacy Shield is a secure digital vault that stores only your most critical documents on European servers and gives your loved ones emergency access when they need it most—unlike general cloud storage that clutters your important files with everything else and subjects your data to US jurisdiction, Legacy Shield's intentional limits and European data residency ensure you focus on what truly matters while maintaining maximum privacy.**

---

## 10. Risk Assessment

### 10.1 Technical Risks
- **Risk**: Client-side encryption complexity leads to bugs that cause data loss
  - **Mitigation**: Extensive testing, open-source crypto libraries, multiple recovery mechanisms (recovery codes, emergency access)

- **Risk**: Browser compatibility issues with Web Crypto API
  - **Mitigation**: Progressive enhancement, browser requirements clearly stated, fallback for older browsers

- **Risk**: Hetzner service outage or data loss
  - **Mitigation**: Multi-datacenter setup (Hetzner Falkenstein + Nuremberg), automated backups, 99.9% SLA

### 10.2 Business Risks
- **Risk**: Free-to-paid conversion rate lower than expected (10-15%)
  - **Mitigation**: Iterate on upgrade prompts, adjust limits, add compelling premium features

- **Risk**: Lifetime pricing ($500) cannibalizes monthly revenue
  - **Mitigation**: Monitor mix, can adjust pricing, lifetime users bring referrals

- **Risk**: European-only hosting limits US market appeal
  - **Mitigation**: Actually a feature for privacy-conscious US users; test messaging

### 10.3 Security Risks
- **Risk**: Zero-knowledge architecture means users who forget passwords lose access
  - **Mitigation**: Multiple recovery options (recovery codes, emergency access), clear warnings during signup

- **Risk**: Emergency access unlock phrase could be compromised
  - **Mitigation**: Educate users on sharing phrase securely, optional notification when emergency access used, ability to rotate emergency key

### 10.4 Market Risks
- **Risk**: Market doesn't perceive value in paying for document storage
  - **Mitigation**: Focus on emergency access and peace of mind value prop, target users who've experienced estate chaos

- **Risk**: Regulatory changes (data residency, encryption regulations)
  - **Mitigation**: Monitor regulations, European hosting actually protects against US regulations, design for compliance from day 1

---

## 11. European Hosting Value Proposition

### 11.1 Why European Hosting Matters

**For EU customers:**
- GDPR compliance is native, not an afterthought
- Data sovereignty: documents never leave EU jurisdiction
- Protection from foreign surveillance laws (CLOUD Act, FISA, etc.)
- Peace of mind that data is subject to strong EU privacy laws

**For US customers:**
- Protection from US government data requests without warrant
- Enhanced privacy from US tech giants
- Perception of higher privacy standards
- Differentiation from US competitors (Dropbox, Google Drive)

### 11.2 Marketing Messaging

**Homepage:**
> "Your most sensitive documents. Encrypted. On European soil. Forever."

**Trust signals:**
- "100% European infrastructure. Zero US jurisdiction."
- "GDPR-native. Your data rights are built-in, not bolted on."
- "Hosted in Germany by Hetzner - renowned for privacy and security."

**FAQ:**
> **Q: Why European hosting?**
> A: Your critical documents deserve the highest privacy protection. By hosting exclusively in Europe, your data is protected by the world's strongest privacy laws (GDPR) and never subject to foreign surveillance laws. Whether you're in Boston or Berlin, your vault is safe from overreach.

---

## 12. Open Questions

### 12.1 Product Questions
- Should we allow document versioning (keep history of updates to a will)?
- How do we handle when someone actually dies? Should there be a formal "death notification" flow?
- Should we support voice memos or video messages ("message to loved ones")?
- Do we need a "vault health check" feature that prompts users to review/update docs annually?

### 12.2 Business Questions
- Should we offer a family plan (2 adults share a vault)?
- Is there a B2B2C opportunity with European estate planning attorneys?
- Should we build a referral program (free months for successful referrals)?
- What's our stance on crypto recovery keys? (High value but high risk if we mishandle)
- Should we market differently in EU vs US (emphasize GDPR vs privacy from US surveillance)?

### 12.3 Technical Questions
- Should we support biometric unlock (Face ID, Touch ID) for faster access?
- Do we need offline access capability (PWA with service workers)?
- Should we build browser extensions for quick document access?
- How do we handle very large files (50MB+ scanned documents)?
- Should we add a second European region for redundancy (e.g., Finland)?

---

## Appendix A: User Research Insights

### Key Findings from Target Audience Interviews

**Pain Point 1: Scattered documents**
> "I have my will in a file cabinet, my insurance cards in my wallet, scans of my passport on Google Drive, and my tax returns on an old hard drive. When my lawyer asked for my property deed, it took me 3 days to find it." - Sarah, 52

**Pain Point 2: Estate planning anxiety**
> "My father passed away last year. We spent weeks trying to find his life insurance policy, bank account numbers, and safe deposit box. He had told us 'everything is in the filing cabinet' but there were 20 years of documents. I never want to put my kids through that." - Michael, 47

**Pain Point 3: Travel stress**
> "I travel for work constantly. I've had to email myself copies of my passport, insurance card, and vaccination records multiple times. I know it's not secure but it's the only way I can access them when I need them." - Elena, 55

**Insight: Emergency access is underserved**
> "I've set up my will and trust, but I don't know how my wife would actually find all the account numbers and documents she'd need. There's no good solution for 'here's everything in one place if something happens to me.'" - David, 49

**Insight: Privacy concerns are growing**
> "I don't want my financial documents, medical records, and will on some US server where the government can access them without a warrant. I'd pay extra for European hosting." - Anna, 51 (Amsterdam)

---

## Appendix B: Glossary

- **Zero-knowledge encryption**: A security model where the service provider has no ability to decrypt user data
- **Client-side encryption**: Encryption that occurs in the user's browser before data is transmitted to servers
- **Master key**: The primary encryption key derived from the user's password, used to encrypt all file-specific keys
- **Emergency key**: A separate encryption key derived from the unlock phrase, used to provide read-only access to emergency contacts
- **Unlock phrase**: A user-created memorable phrase that emergency contacts use to access the vault
- **Recovery codes**: One-time-use codes generated during signup that allow account recovery if password is forgotten
- **Dual-key encryption**: System where each file is encrypted with two separate keys (owner key and emergency key)
- **GDPR**: General Data Protection Regulation - EU regulation on data protection and privacy
- **Data residency**: The physical location where data is stored and processed

---

**End of Product Specification**
