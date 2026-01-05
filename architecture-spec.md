# Legacy Shield - Technical Architecture Specification

**Version:** 1.0
**Last Updated:** January 5, 2026
**Authors:** Engineering Team

---

## 1. System Overview

### 1.1 High-Level Architecture

Legacy Shield uses a **client-side encryption architecture** where all encryption and decryption operations occur in the user's browser. The backend API never has access to plaintext documents or encryption keys, implementing a true zero-knowledge system.

**Critical Design Decision:** All infrastructure is hosted exclusively on European cloud providers to ensure data sovereignty and maximum privacy protection.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser - Worldwide)              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React/Next.js Frontend                                │ │
│  │  - UI Components                                       │ │
│  │  - Crypto Module (encryption/decryption)               │ │
│  │  - Key Derivation (password → master key)             │ │
│  │  - File Encryption (before upload)                     │ │
│  │  - File Decryption (after download)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS (TLS 1.3)
                        │ Encrypted file blobs
                        │ Encrypted file keys
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          BACKEND API (Node.js) - EUROPE ONLY                 │
│          Location: Hetzner Falkenstein, Germany              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express/Fastify Server                                │ │
│  │  - Authentication (JWT, sessions)                      │ │
│  │  - Authorization (owner vs emergency contact)          │ │
│  │  - File metadata management                            │ │
│  │  - User management                                     │ │
│  │  - Audit logging                                       │ │
│  │  - Background jobs (expiration reminders)              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────┬────────────────────────────────┬────────────────────┘
        │                                │
        ▼                                ▼
┌──────────────────┐           ┌──────────────────────┐
│   PostgreSQL     │           │  Hetzner Object      │
│   (Hetzner DB)   │           │  Storage             │
│   Germany        │           │  Germany             │
│                  │           │                      │
│ - Users          │           │ - Encrypted file     │
│ - Files          │           │   blobs              │
│ - Emergency      │           │                      │
│   contacts       │           │ (Server never has    │
│ - Sessions       │           │  decryption keys)    │
│ - Audit logs     │           │                      │
└──────────────────┘           └──────────────────────┘

ALL INFRASTRUCTURE: 🇪🇺 European Union Only
```

### 1.2 Core Architectural Principles

1. **Zero-knowledge**: Server never has access to plaintext documents or encryption keys
2. **Client-side cryptography**: All encryption/decryption in browser using Web Crypto API
3. **Defense in depth**: Multiple security layers (TLS, encryption at rest, encrypted blobs, 2FA)
4. **Minimal trust**: Even if servers compromised, encrypted data remains secure
5. **Dual-key architecture**: Each file encrypted with owner key AND emergency key for flexible access control
6. **Auditability**: Complete audit trail of all access and operations
7. **European data sovereignty**: 100% EU-hosted infrastructure, no data leaves European jurisdiction

---

## 2. Technology Stack

### 2.1 Frontend

**Framework & Libraries:**
- **Next.js 14+** (App Router) - React framework with SSR/SSG
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Query (TanStack Query)** - Server state management
- **Zustand** or **Jotai** - Client state management (crypto keys in memory)
- **React Hook Form** - Form handling
- **Zod** - Schema validation

**Cryptography:**
- **Web Crypto API** - Native browser crypto (AES-256-GCM, PBKDF2)
- **@noble/ciphers** - Backup/polyfill for older browsers
- **@noble/hashes** - Hashing utilities (SHA-256, Argon2)

**Document Viewing:**
- **react-pdf** or **PDF.js** - PDF rendering
- **react-image-gallery** - Image viewing
- **mammoth.js** - DOCX preview (convert to HTML)

**File Upload:**
- **react-dropzone** - Drag-and-drop upload

**Hosting:**
- **Hetzner Cloud** - Frontend served from Germany
- Or **Vercel Edge Network** (with EU-only region restriction if possible)
- Or **Cloudflare Pages** (EU workers only)

### 2.2 Backend

**Framework & Libraries:**
- **Node.js 20+ LTS**
- **Express** or **Fastify** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **Zod** - Runtime validation (shared with frontend)
- **Hetzner Object Storage SDK** - Object storage interactions
- **Passport.js** or **Lucia** - Authentication
- **jsonwebtoken** - JWT tokens
- **bcrypt** - Password hashing (for login, not encryption)
- **Bull** or **BullMQ** - Background job queue (Redis)
- **Winston** or **Pino** - Logging
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

**Hosting:**
- **Hetzner Cloud Servers** (Dedicated vCPU or Cloud instances)
- **Location**: Falkenstein, Germany (primary)
- **Backup location**: Nuremberg, Germany or Helsinki, Finland

### 2.3 Database

**Primary Database:**
- **PostgreSQL 15+**
- **Hosting**: Hetzner Managed PostgreSQL or self-managed on Hetzner Cloud
- **Location**: Germany (Falkenstein datacenter)
- **Backup**: Automated daily backups to separate Hetzner datacenter (Nuremberg)

**Caching/Queue:**
- **Redis** - Session storage, job queue, rate limiting
- **Hosting**: Hetzner Cloud (co-located with API server)

### 2.4 File Storage

**Object Storage:**
- **Hetzner Object Storage** (S3-compatible)
  - Location: Germany
  - Cost: €0.0052/GB/month (~4.5x cheaper than AWS S3)
  - No egress fees for EU traffic
  - S3-compatible API (easy migration if needed)
- **Alternative**: **Scaleway Object Storage** (France) or **Exoscale** (Switzerland)
- **Encryption**: Files encrypted client-side before upload; storage sees only encrypted blobs

**Why not AWS/GCP/Azure?**
- US-based companies subject to CLOUD Act
- Data sovereignty concerns
- Higher costs
- Against our privacy-first positioning

### 2.5 Infrastructure & DevOps

**Hosting:**
- **Development**: Docker Compose (local)
- **Staging**: Hetzner Cloud (single server)
- **Production**: Hetzner Cloud (load balanced, multi-server)

**Load Balancing:**
- **Hetzner Load Balancer** (native, €5.50/month)
- Or **HAProxy** on dedicated instance

**CI/CD:**
- **GitHub Actions** - Automated testing, building, deployment
- **GitLab CI** (alternative, EU-based company)

**Monitoring:**
- **Sentry** (EU region) - Error tracking
- **Plausible Analytics** (EU-based, privacy-focused) - Web analytics
- **Uptime Kuma** (self-hosted) or **Better Uptime** (EU) - Uptime monitoring
- **Grafana + Prometheus** (self-hosted on Hetzner) - Infrastructure monitoring

**Email:**
- **Resend** (EU region) - Transactional emails
- Or **Postmark** (EU region)
- Or **Mailgun** (EU region)

**Payments:**
- **Stripe** - Payment processing (subscriptions + one-time)
  - Note: Stripe is US company but has EU entities and GDPR compliance
  - Data processed in EU where possible
  - Alternative: **Mollie** (EU-based payment processor)

### 2.6 European Infrastructure Summary

| Component | Provider | Location | Cost (est.) |
|-----------|----------|----------|-------------|
| API Servers (2x) | Hetzner Cloud CPX31 | Falkenstein, DE | €26/month |
| PostgreSQL | Hetzner Managed DB | Falkenstein, DE | €30/month |
| Redis | Hetzner Cloud CX11 | Falkenstein, DE | €4/month |
| Object Storage (100GB) | Hetzner Object Storage | Germany | €0.52/month |
| Load Balancer | Hetzner LB | Germany | €5.50/month |
| Backups | Hetzner Backup | Nuremberg, DE | €10/month |
| **Total Infrastructure** | | | **~€76/month** |

**For comparison:** Equivalent AWS setup in US: ~$200-300/month

---

## 3. Data Model

### 3.1 Database Schema

```typescript
// User account
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String    // bcrypt hash for login auth

  // Account status
  emailVerified         Boolean   @default(false)
  tier                  UserTier  @default(FREE) // FREE or PRO

  // Subscription
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  lifetimePurchase      Boolean   @default(false)
  lifetimePurchaseDate  DateTime?
  subscriptionEndsAt    DateTime?

  // Security
  twoFactorSecret       String?   // TOTP secret (encrypted)
  twoFactorEnabled      Boolean   @default(false)
  recoveryCodes         String[]  // Hashed recovery codes

  // Emergency access
  emergencyKeyEncrypted String?   // Emergency key encrypted with master key
  emergencyKeySalt      String?   // Salt for deriving emergency key from phrase
  emergencyPhraseHash   String?   // Hash of emergency phrase (to validate unlock)

  // Metadata
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  lastLoginAt           DateTime?

  // Relations
  files                 File[]
  emergencyContacts     EmergencyContact[]
  sessions              Session[]
  auditLogs             AuditLog[]
}

enum UserTier {
  FREE  // 15 docs, 1 emergency contact
  PRO   // 100 docs, 5 emergency contacts
}

// File metadata (encrypted file data stored in Hetzner Object Storage)
model File {
  id                    String    @id @default(uuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // File info
  filename              String    // Original filename (can be encrypted)
  fileSizeBytes         Int
  mimeType              String
  storageKey            String    @unique // Hetzner Object Storage key
  storageBucket         String    // Bucket name

  // Encryption
  ownerEncryptedKey     String    // File key encrypted with owner's master key
  emergencyEncryptedKey String?   // File key encrypted with emergency key
  iv                    String    // Initialization vector for AES-GCM
  authTag               String    // Authentication tag for AES-GCM

  // Organization
  category              FileCategory?
  tags                  String[]
  isFavorite            Boolean   @default(false)
  isEmergencyPriority   Boolean   @default(false)

  // Expiration tracking
  expiresAt             DateTime?
  expirationReminderSent Boolean  @default(false)

  // Metadata
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime? // Soft delete

  // Relations
  relatedFiles          FileRelation[] @relation("sourceFile")
  relatedToFiles        FileRelation[] @relation("targetFile")
  auditLogs             AuditLog[]

  @@index([userId, deletedAt])
  @@index([category])
  @@index([expiresAt])
}

enum FileCategory {
  IDENTITY
  PROPERTY
  FINANCIAL
  INSURANCE
  MEDICAL
  LEGAL
  TAX
  TRAVEL
  FAMILY
  DIGITAL_ASSETS
  OTHER
}

// Document relationships (e.g., insurance policy + insurance card)
model FileRelation {
  id              String   @id @default(uuid())
  sourceFileId    String
  targetFileId    String
  relationType    String   // "related", "supersedes", "attachment"

  sourceFile      File     @relation("sourceFile", fields: [sourceFileId], references: [id], onDelete: Cascade)
  targetFile      File     @relation("targetFile", fields: [targetFileId], references: [id], onDelete: Cascade)

  createdAt       DateTime @default(now())

  @@unique([sourceFileId, targetFileId])
}

// Emergency contacts
model EmergencyContact {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Contact info
  name            String
  relationship    String   // "spouse", "child", "sibling", "friend", "attorney"
  email           String?
  phone           String?
  notes           String?  // Instructions for the contact

  // Access tracking
  lastAccessedAt  DateTime?
  accessCount     Int      @default(0)

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

// Sessions (JWT tokens stored in httpOnly cookies)
model Session {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  sessionType     SessionType @default(OWNER)

  // Session data
  token           String      @unique // JWT token (also in httpOnly cookie)
  userAgent       String?
  ipAddress       String?

  // Expiration
  expiresAt       DateTime
  createdAt       DateTime    @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

enum SessionType {
  OWNER             // Full CRUD access
  EMERGENCY_CONTACT // Read-only access via unlock phrase
}

// Audit log for security and compliance
model AuditLog {
  id              String      @id @default(uuid())
  userId          String?
  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  fileId          String?
  file            File?       @relation(fields: [fileId], references: [id], onDelete: SetNull)

  // Event details
  action          AuditAction
  sessionType     SessionType?
  resourceType    String      // "user", "file", "emergency_contact"
  resourceId      String?

  // Context
  ipAddress       String?
  userAgent       String?
  metadata        Json?       // Additional context (e.g., {"fileName": "passport.pdf"})

  // Timestamp
  createdAt       DateTime    @default(now())

  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([fileId])
}

enum AuditAction {
  // Auth
  LOGIN
  LOGOUT
  LOGIN_FAILED
  PASSWORD_CHANGE
  TWO_FACTOR_ENABLED
  TWO_FACTOR_DISABLED
  RECOVERY_CODE_USED

  // Files
  FILE_UPLOAD
  FILE_VIEW
  FILE_DOWNLOAD
  FILE_DELETE
  FILE_UPDATE

  // Emergency access
  EMERGENCY_ACCESS_SETUP
  EMERGENCY_ACCESS_USED
  EMERGENCY_PHRASE_VALIDATED
  EMERGENCY_KEY_ROTATED

  // Account
  ACCOUNT_CREATED
  ACCOUNT_UPGRADED
  ACCOUNT_DOWNGRADED
  ACCOUNT_DELETED
}

// Background jobs tracking
model Job {
  id              String      @id @default(uuid())
  type            JobType
  status          JobStatus   @default(PENDING)

  // Job data
  payload         Json        // Job-specific data
  result          Json?       // Job result or error

  // Execution
  attempts        Int         @default(0)
  maxAttempts     Int         @default(3)
  scheduledFor    DateTime    @default(now())
  startedAt       DateTime?
  completedAt     DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([status, scheduledFor])
  @@index([type, status])
}

enum JobType {
  SEND_EXPIRATION_REMINDER
  SEND_EMAIL
  CLEANUP_DELETED_FILES
  GENERATE_USAGE_REPORT
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

### 3.2 File Storage Structure (Hetzner Object Storage)

```
legacy-shield-vault-eu (bucket in Germany)
├── users/
│   ├── {userId}/
│   │   ├── files/
│   │   │   ├── {fileId}.encrypted     # Encrypted file blob
│   │   │   └── {fileId}.metadata.json # Backup metadata (redundant with DB)
│   │   └── temp/                      # Temporary upload staging
│   │       └── {uploadId}.part
```

**Object Metadata (on each encrypted file):**
- `user-id`: User UUID
- `file-id`: File UUID
- `encrypted`: "true"
- `upload-timestamp`: ISO 8601 timestamp
- `data-residency`: "EU"

---

## 4. Security Architecture

### 4.1 Encryption Design

#### 4.1.1 Key Derivation Flow

```
User enters password
        ↓
PBKDF2-SHA256 (100,000 iterations) + salt
        ↓
Master Key (256-bit)
        ↓
Used to encrypt/decrypt file keys
```

**Password → Login Hash (for authentication):**
```
User password + salt → bcrypt (10 rounds) → Password hash (stored in DB)
```

**Password → Master Key (for encryption):**
```
User password + user-specific salt → PBKDF2-SHA256 (100k iterations) → Master key (never sent to server)
```

**Important**: These are **separate processes**. Login hash is stored server-side for authentication. Master key is derived client-side and never leaves the browser.

#### 4.1.2 File Encryption Flow

```
1. User selects file to upload
2. Generate random file key (256-bit)
3. Encrypt file with AES-256-GCM using file key
   ↳ Produces: Encrypted blob + IV + Auth tag
4. Encrypt file key with owner's master key (AES-256-GCM)
   ↳ ownerEncryptedKey
5. Encrypt file key with emergency key (AES-256-GCM)
   ↳ emergencyEncryptedKey
6. Upload to server:
   - Encrypted blob → Hetzner Object Storage (Germany)
   - ownerEncryptedKey, emergencyEncryptedKey, IV, authTag → PostgreSQL (Germany)
```

**Why AES-256-GCM?**
- Industry standard for authenticated encryption
- Provides both confidentiality and integrity
- Built into Web Crypto API
- Fast on modern hardware

#### 4.1.3 File Decryption Flow (Owner)

```
1. User requests file
2. Server returns:
   - Presigned URL to encrypted blob (Hetzner Object Storage)
   - ownerEncryptedKey, IV, authTag
3. Client:
   a. Decrypt ownerEncryptedKey using master key → file key
   b. Download encrypted blob from Hetzner
   c. Decrypt blob using file key, IV, authTag → plaintext file
4. Render in browser (PDF viewer, image viewer, etc.)
```

#### 4.1.4 Emergency Access Encryption

**Setup Phase:**
```
1. Owner creates unlock phrase (e.g., "Mom's maiden name + year we moved")
2. Derive emergency key:
   Unlock phrase + salt → PBKDF2-SHA256 (100k iterations) → Emergency key
3. Store hash of unlock phrase in DB (to validate later)
4. Encrypt emergency key with owner's master key → emergencyKeyEncrypted (stored in DB)
5. For each file:
   Encrypt file key with emergency key → emergencyEncryptedKey (stored in DB)
```

**Emergency Access Phase:**
```
1. Emergency contact enters unlock phrase
2. Derive emergency key from phrase + salt (salt is public)
3. Validate derived key by checking against stored phrase hash
4. Use emergency key to decrypt file keys → access files
5. Create read-only session (SESSION_TYPE = EMERGENCY_CONTACT)
```

### 4.2 Authentication & Authorization

#### 4.2.1 Registration Flow
```
1. User submits email + password
2. Server:
   a. Validate email format, check uniqueness
   b. Hash password with bcrypt → passwordHash
   c. Generate salt for key derivation (store in user record)
   d. Create user record
   e. Send verification email
3. Client:
   a. Derive master key from password + salt (keep in memory)
   b. Prompt for 2FA setup
4. 2FA Setup:
   a. Generate TOTP secret
   b. Display QR code
   c. User scans with authenticator app
   d. User enters code to confirm
   e. Generate recovery codes (10 codes)
   f. User downloads recovery codes
   g. Enable 2FA in user record
```

#### 4.2.2 Login Flow
```
1. User enters email + password
2. Server:
   a. Find user by email
   b. Verify password against bcrypt hash
   c. If valid, request 2FA code
3. User enters 2FA code
4. Server:
   a. Validate TOTP code
   b. Create session (JWT token)
   c. Store session in DB
   d. Set httpOnly cookie with JWT
   e. Log audit event (LOGIN)
5. Client:
   a. Derive master key from password + salt
   b. Store master key in memory (Zustand/Jotai)
   c. Redirect to dashboard
```

**JWT Payload:**
```json
{
  "userId": "uuid",
  "sessionId": "uuid",
  "sessionType": "OWNER",
  "tier": "PRO",
  "iat": 1704470400,
  "exp": 1704556800
}
```

**Session Duration:**
- Access token: 15 minutes
- Refresh token: 7 days (httpOnly cookie)
- Auto-refresh before expiration

#### 4.2.3 Authorization Model

**Access Control Matrix:**

| Action | Owner Session | Emergency Contact Session |
|--------|---------------|---------------------------|
| Upload file | ✅ | ❌ |
| View file | ✅ | ✅ |
| Download file | ✅ | ✅ |
| Delete file | ✅ | ❌ |
| Update file metadata | ✅ | ❌ |
| Set up emergency access | ✅ | ❌ |
| Rotate emergency key | ✅ | ❌ |

**Implementation:**
- Middleware checks `sessionType` from JWT
- API endpoints enforce permissions based on session type
- Frontend also hides UI elements for unauthorized actions (defense in depth)

### 4.3 Security Best Practices

#### 4.3.1 OWASP Top 10 Mitigations

1. **Injection**: Prisma ORM (parameterized queries), input validation with Zod
2. **Broken Authentication**: 2FA mandatory, secure session management, rate limiting
3. **Sensitive Data Exposure**: Client-side encryption, TLS 1.3, no plaintext logging
4. **XML External Entities (XXE)**: Not applicable (no XML parsing)
5. **Broken Access Control**: Session-based authorization, middleware enforcement
6. **Security Misconfiguration**: Helmet.js security headers, CORS configured
7. **XSS**: React auto-escaping, Content Security Policy (CSP) headers
8. **Insecure Deserialization**: JSON only, validate with Zod
9. **Using Components with Known Vulnerabilities**: Automated dependency scanning (Dependabot)
10. **Insufficient Logging & Monitoring**: Comprehensive audit logs, error tracking (Sentry EU)

#### 4.3.2 Additional Security Measures

**Rate Limiting:**
- Login attempts: 5 per 15 minutes per IP
- API requests: 100 per minute per user
- File uploads: 10 per hour per user (free tier), 50 per hour (pro)

**Content Security Policy (CSP):**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://api.stripe.com;
  frame-ancestors 'none';
```

**HTTP Security Headers:**
- `Strict-Transport-Security`: Force HTTPS
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

**Password Requirements:**
- Minimum 12 characters
- At least one uppercase, lowercase, number, special char
- No common passwords (check against compromised password list)
- Password strength indicator (zxcvbn)

**Secrets Management:**
- Environment variables for secrets (never commit)
- Hetzner vaults or self-hosted Vault for production secrets
- Rotate secrets regularly (JWT signing keys, encryption keys)

---

## 5. API Design

### 5.1 API Architecture

**Style:** RESTful JSON API
**Base URL:** `https://api.legacyshield.com/v1`
**Authentication:** JWT in httpOnly cookie + CSRF token
**Hosting:** Hetzner Cloud, Germany

### 5.2 Core Endpoints

#### Authentication

```typescript
POST /auth/register
Body: { email, password }
Response: { userId, message: "Verification email sent" }

POST /auth/verify-email
Body: { token }
Response: { success: true }

POST /auth/login
Body: { email, password }
Response: { requiresTwoFactor: true }

POST /auth/login/2fa
Body: { code }
Response: { accessToken, user: { id, email, tier } }
Set-Cookie: refreshToken (httpOnly)

POST /auth/logout
Response: { success: true }

POST /auth/refresh
Cookie: refreshToken
Response: { accessToken }
Set-Cookie: refreshToken (httpOnly)

POST /auth/password/change
Body: { currentPassword, newPassword }
Response: { success: true }

POST /auth/recovery/generate-codes
Response: { recoveryCodes: string[] }

POST /auth/recovery/use-code
Body: { recoveryCode }
Response: { accessToken }
```

#### User Management

```typescript
GET /users/me
Response: {
  id, email, tier, emailVerified, twoFactorEnabled,
  documentCount, documentLimit, emergencyContactCount, emergencyContactLimit,
  subscription: { status, endsAt, isLifetime },
  dataResidency: "EU" // Always EU for Legacy Shield
}

PATCH /users/me
Body: { email?, ... }
Response: { user }

DELETE /users/me
Body: { password, confirmation: "DELETE MY ACCOUNT" }
Response: { success: true }
```

#### Files

```typescript
GET /files
Query: { category?, tag?, search?, limit?, offset? }
Response: {
  files: [{ id, filename, category, tags, sizeBytes, createdAt, isFavorite, isEmergencyPriority }],
  total, limit, offset
}

POST /files/upload
Body: multipart/form-data {
  file: File,
  metadata: {
    filename, category, tags[], isFavorite, isEmergencyPriority,
    ownerEncryptedKey, emergencyEncryptedKey, iv, authTag,
    expiresAt?
  }
}
Response: {
  fileId,
  uploadUrl: "presigned Hetzner Object Storage URL"
}
// Client then uploads encrypted blob to Hetzner presigned URL

GET /files/:id
Response: {
  file: { id, filename, category, tags, sizeBytes, createdAt, ... },
  downloadUrl: "presigned Hetzner Object Storage URL",
  ownerEncryptedKey, emergencyEncryptedKey, iv, authTag
}

PATCH /files/:id
Body: { filename?, category?, tags?, isFavorite?, isEmergencyPriority?, expiresAt? }
Response: { file }

DELETE /files/:id
Response: { success: true }

POST /files/:id/relations
Body: { targetFileId, relationType }
Response: { relation }

GET /files/:id/audit-logs
Response: { logs: [{ action, timestamp, sessionType, ipAddress }] }
```

#### Emergency Access

```typescript
POST /emergency-access/setup
Body: {
  emergencyPhraseHash,
  emergencyKeyEncrypted,
  emergencyKeySalt
}
Response: { success: true }

POST /emergency-access/validate
Body: { emergencyPhraseHash }
Response: { valid: true, sessionToken }
// Creates EMERGENCY_CONTACT session

POST /emergency-access/contacts
Body: { name, relationship, email?, phone?, notes? }
Response: { contact }

GET /emergency-access/contacts
Response: { contacts: [...] }

PATCH /emergency-access/contacts/:id
Body: { name?, email?, ... }
Response: { contact }

DELETE /emergency-access/contacts/:id
Response: { success: true }

POST /emergency-access/rotate-key
Body: { newEmergencyKeyEncrypted, newEmergencyPhraseHash }
// Re-encrypts all file keys with new emergency key
Response: { success: true }
```

#### Subscriptions

```typescript
POST /subscriptions/checkout
Body: { tier: "PRO", interval: "lifetime" | "monthly" }
Response: { stripeCheckoutUrl }

POST /subscriptions/portal
Response: { stripePortalUrl }

GET /subscriptions/status
Response: {
  tier, status, currentPeriodEnd, cancelAtPeriodEnd,
  isLifetime, lifetimePurchaseDate
}

POST /webhooks/stripe
Body: Stripe webhook payload
Response: { received: true }
```

### 5.3 Error Handling

**Standard Error Response:**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "field": "password",
    "details": {}
  }
}
```

**HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (e.g., email already exists)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Maintenance mode

**Error Codes:**
```typescript
enum ErrorCode {
  // Auth
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED",
  INVALID_TWO_FACTOR_CODE = "INVALID_TWO_FACTOR_CODE",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_EMAIL = "INVALID_EMAIL",
  PASSWORD_TOO_WEAK = "PASSWORD_TOO_WEAK",

  // Resources
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // Limits
  DOCUMENT_LIMIT_REACHED = "DOCUMENT_LIMIT_REACHED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  EMERGENCY_CONTACT_LIMIT_REACHED = "EMERGENCY_CONTACT_LIMIT_REACHED",

  // Permissions
  READ_ONLY_SESSION = "READ_ONLY_SESSION",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Server
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}
```

---

## 6. Frontend Architecture

### 6.1 Application Structure

```
web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── emergency-access/
│   │   │   ├── settings/
│   │   │   └── layout.tsx        # Protected layout
│   │   ├── emergency-access/     # Public emergency portal
│   │   ├── api/                  # API routes (if needed)
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── documents/
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── DocumentList.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── TwoFactorInput.tsx
│   │   │   └── RecoveryCodeDisplay.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── crypto/               # Cryptography module
│   │   │   ├── keyDerivation.ts
│   │   │   ├── fileEncryption.ts
│   │   │   ├── emergencyAccess.ts
│   │   │   └── utils.ts
│   │   ├── api/                  # API client
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── files.ts
│   │   │   └── emergencyAccess.ts
│   │   ├── storage/              # Local storage management
│   │   │   └── secureStorage.ts  # Manage keys in memory/sessionStorage
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── formatting.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFiles.ts
│   │   ├── useEncryption.ts
│   │   └── useUpload.ts
│   │
│   ├── store/
│   │   ├── authStore.ts          # Zustand store for auth state
│   │   └── cryptoStore.ts        # In-memory master key storage
│   │
│   └── types/
│       ├── api.ts
│       ├── crypto.ts
│       └── models.ts
```

### 6.2 Crypto Module Design

```typescript
// lib/crypto/keyDerivation.ts

import { subtle } from 'crypto';

/**
 * Derive master key from user password
 * This key is used to encrypt/decrypt file keys
 * NEVER send this to the server
 */
export async function deriveMasterKey(
  password: string,
  salt: string
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBuffer = enc.encode(salt);

  // Import password as key material
  const keyMaterial = await subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive 256-bit key using PBKDF2
  const masterKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt']
  );

  return masterKey;
}

/**
 * Derive emergency key from unlock phrase
 */
export async function deriveEmergencyKey(
  unlockPhrase: string,
  salt: string
): Promise<CryptoKey> {
  // Same process as master key
  return deriveMasterKey(unlockPhrase, salt);
}
```

```typescript
// lib/crypto/fileEncryption.ts

/**
 * Encrypt a file before upload
 */
export async function encryptFile(
  file: File,
  masterKey: CryptoKey,
  emergencyKey?: CryptoKey
): Promise<EncryptedFileData> {
  // 1. Generate random file key
  const fileKey = await subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable (so we can encrypt it)
    ['encrypt', 'decrypt']
  );

  // 2. Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // 3. Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 4. Encrypt file with file key
  const encryptedContent = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    fileKey,
    fileBuffer
  );

  // 5. Export file key as raw bytes
  const fileKeyRaw = await subtle.exportKey('raw', fileKey);

  // 6. Encrypt file key with master key
  const ownerIV = crypto.getRandomValues(new Uint8Array(12));
  const ownerEncryptedKey = await subtle.encrypt(
    { name: 'AES-GCM', iv: ownerIV },
    masterKey,
    fileKeyRaw
  );

  // 7. Encrypt file key with emergency key (if provided)
  let emergencyEncryptedKey: ArrayBuffer | undefined;
  let emergencyIV: Uint8Array | undefined;
  if (emergencyKey) {
    emergencyIV = crypto.getRandomValues(new Uint8Array(12));
    emergencyEncryptedKey = await subtle.encrypt(
      { name: 'AES-GCM', iv: emergencyIV },
      emergencyKey,
      fileKeyRaw
    );
  }

  return {
    encryptedBlob: new Blob([encryptedContent]),
    ownerEncryptedKey: arrayBufferToBase64(ownerEncryptedKey),
    ownerIV: arrayBufferToBase64(ownerIV),
    emergencyEncryptedKey: emergencyEncryptedKey
      ? arrayBufferToBase64(emergencyEncryptedKey)
      : undefined,
    emergencyIV: emergencyIV
      ? arrayBufferToBase64(emergencyIV)
      : undefined,
    iv: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt a file after download
 */
export async function decryptFile(
  encryptedBlob: Blob,
  encryptedFileKey: string, // Base64
  iv: string, // Base64
  masterKey: CryptoKey
): Promise<ArrayBuffer> {
  // 1. Decrypt file key using master key
  const encryptedKeyBuffer = base64ToArrayBuffer(encryptedFileKey);
  const ivBuffer = base64ToArrayBuffer(iv);

  const fileKeyRaw = await subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    masterKey,
    encryptedKeyBuffer
  );

  // 2. Import decrypted file key
  const fileKey = await subtle.importKey(
    'raw',
    fileKeyRaw,
    'AES-GCM',
    false,
    ['decrypt']
  );

  // 3. Read encrypted blob
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  // 4. Decrypt file content
  const decryptedContent = await subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    fileKey,
    encryptedBuffer
  );

  return decryptedContent;
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
```

### 6.3 State Management

**Crypto Store (Sensitive Data - In Memory Only):**
```typescript
// store/cryptoStore.ts
import { create } from 'zustand';

interface CryptoStore {
  masterKey: CryptoKey | null;
  emergencyKey: CryptoKey | null;
  setMasterKey: (key: CryptoKey) => void;
  setEmergencyKey: (key: CryptoKey) => void;
  clearKeys: () => void;
}

export const useCryptoStore = create<CryptoStore>((set) => ({
  masterKey: null,
  emergencyKey: null,
  setMasterKey: (key) => set({ masterKey: key }),
  setEmergencyKey: (key) => set({ emergencyKey: key }),
  clearKeys: () => set({ masterKey: null, emergencyKey: null }),
}));

// Clear keys on logout or page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useCryptoStore.getState().clearKeys();
  });
}
```

**Auth Store:**
```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  sessionType: SessionType | null;
  setUser: (user: User) => void;
  setSessionType: (type: SessionType) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      sessionType: null,
      setUser: (user) => set({ user }),
      setSessionType: (type) => set({ sessionType: type }),
      logout: () => set({ user: null, sessionType: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive data
      partialize: (state) => ({ user: state.user, sessionType: state.sessionType }),
    }
  )
);
```

---

## 7. Deployment & Infrastructure (European Hosting)

### 7.1 Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: legacyshield
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: legacyshield_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:  # S3-compatible local storage (simulates Hetzner Object Storage)
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### 7.2 Production Architecture (Hetzner Cloud)

```
Internet (Worldwide)
    ↓
┌──────────────────────────────────┐
│  Hetzner Load Balancer           │
│  Location: Falkenstein, Germany  │
│  - SSL Termination (TLS 1.3)     │
│  - Health checks                 │
└──────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│  Hetzner Cloud - API Servers (Auto-scaling)  │
│  2x CPX31 (4 vCPU, 8GB RAM)                  │
│  Location: Falkenstein, Germany              │
│  - API application (Node.js)                 │
│  - Background job workers                    │
└──────────────────────────────────────────────┘
    ↓                              ↓
┌─────────────────────┐   ┌────────────────────────┐
│  Hetzner Managed    │   │  Hetzner Object        │
│  PostgreSQL         │   │  Storage               │
│  Location: DE       │   │  Location: Germany     │
│  - Primary DB       │   │  - Encrypted files     │
│  - Automated backup │   │  - S3-compatible API   │
│    to Nuremberg     │   │                        │
└─────────────────────┘   └────────────────────────┘

    ↓
┌─────────────────────┐
│  Redis (Hetzner CX11)│
│  Location: DE        │
│  - Session cache     │
│  - Job queue         │
└─────────────────────┘

Monitoring Stack (Self-hosted on Hetzner):
- Grafana + Prometheus
- Uptime Kuma
- Log aggregation

External EU Services:
- Sentry (EU region) - Error tracking
- Plausible (EU) - Analytics
- Resend (EU) - Email
```

### 7.3 Hetzner Cloud Setup

**Server Specifications:**

| Purpose | Instance Type | vCPU | RAM | Storage | Cost/month |
|---------|---------------|------|-----|---------|-----------|
| API Server (Primary) | CPX31 | 4 | 8GB | 160GB | €13.00 |
| API Server (Secondary) | CPX31 | 4 | 8GB | 160GB | €13.00 |
| Redis Cache | CX11 | 1 | 2GB | 20GB | €4.00 |
| Monitoring | CX21 | 2 | 4GB | 40GB | €6.00 |
| **Subtotal Servers** | | | | | **€36.00** |

**Managed Services:**

| Service | Specification | Cost/month |
|---------|--------------|-----------|
| PostgreSQL (Managed) | 2 vCPU, 4GB RAM, 80GB SSD | €30.00 |
| Object Storage | ~100GB average | €0.52 |
| Load Balancer | Standard | €5.50 |
| Backups | Volume snapshots | €10.00 |
| **Subtotal Services** | | **€46.02** |

**Total Infrastructure Cost: ~€82/month** (vs $200-300 on AWS)

### 7.4 Environment Variables

```bash
# .env.production
NODE_ENV=production

# Database (Hetzner Managed PostgreSQL)
DATABASE_URL=postgresql://user:pass@postgres.hetzner.example:5432/legacyshield

# Redis (Hetzner Cloud instance)
REDIS_URL=redis://10.0.0.5:6379

# Hetzner Object Storage (S3-compatible)
STORAGE_ENDPOINT=https://fsn1.your-objectstorage.com
STORAGE_BUCKET=legacy-shield-vault-eu
STORAGE_REGION=fsn1
STORAGE_ACCESS_KEY=xxx
STORAGE_SECRET_KEY=xxx

# Authentication
JWT_SECRET=xxx-long-random-secret-xxx
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://legacyshield.com

# Email (Resend EU region)
RESEND_API_KEY=xxx
EMAIL_FROM=noreply@legacyshield.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_LIFETIME=price_xxx

# Monitoring (Sentry EU)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Feature Flags
DATA_RESIDENCY=EU
ENFORCE_EU_ONLY=true
```

### 7.5 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production (Hetzner EU)

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build -t legacy-shield-api ./packages/api

      - name: Push to registry
        run: |
          echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login registry.hetzner.cloud -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
          docker tag legacy-shield-api:latest registry.hetzner.cloud/legacy-shield/api:latest
          docker push registry.hetzner.cloud/legacy-shield/api:latest

      - name: Deploy to Hetzner Cloud
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HETZNER_SERVER_IP }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/legacy-shield
            docker-compose pull
            docker-compose up -d --no-deps api
            docker-compose exec api npm run migrate:deploy

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build --workspace=web

      # Option 1: Deploy to Hetzner Cloud
      - name: Deploy to Hetzner
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HETZNER_SERVER_IP }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "packages/web/out/*"
          target: "/var/www/legacyshield"

      # Option 2: Or deploy to Vercel (EU region if available)
      # - name: Deploy to Vercel EU
      #   uses: amondnet/vercel-action@v25
      #   with:
      #     vercel-token: ${{ secrets.VERCEL_TOKEN }}
      #     vercel-args: '--prod --regions fra1'  # Frankfurt region
```

---

## 8. Scalability & Performance

### 8.1 Performance Targets

- **API Response Time**: p95 < 200ms (excluding object storage upload/download)
- **File Upload**: Support files up to 10MB
- **Concurrent Users**: Support 1,000 concurrent users initially
- **Database Queries**: p95 < 50ms
- **Frontend Load Time**: First Contentful Paint < 1.5s (EU), < 2.5s (US)

### 8.2 Optimization Strategies

**Database:**
- Indexing on frequently queried fields (userId, category, createdAt)
- Connection pooling (Prisma)
- Read replicas for read-heavy operations (future, when needed)

**File Storage:**
- Hetzner Object Storage native in Germany (low latency for EU)
- CDN for downloads to improve global performance (Cloudflare with EU origin)
- Multipart uploads for files > 5MB
- Presigned URLs for direct upload/download (bypass API server)

**API:**
- Response caching (Redis) for file metadata
- Rate limiting to prevent abuse
- Compression (gzip/brotli)
- Keep-alive connections

**Frontend:**
- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Lazy loading for document viewer
- Service worker for offline access (future)
- CDN deployment (Cloudflare or Hetzner CDN)

**Global Performance (for US users):**
- Cloudflare CDN with EU origin for static assets
- HTTP/3 (QUIC) support
- Brotli compression
- Expected latency: EU users <50ms, US users 150-200ms

**Background Jobs:**
- Bull queue for async tasks (email sending, expiration reminders)
- Scheduled jobs via cron (cleanup deleted files after 30 days)

### 8.3 Scaling Strategy

**Phase 1 (0-1,000 users):**
- 2x API servers (Hetzner CPX31)
- Single PostgreSQL instance (Hetzner Managed)
- Single Redis instance
- Hetzner Object Storage

**Phase 2 (1,000-10,000 users):**
- Auto-scaling API servers (2-6 instances)
- Dedicated background job workers (separate from API)
- PostgreSQL vertical scaling (more CPU/RAM)
- Redis cluster for high availability

**Phase 3 (10,000+ users):**
- Multi-region EU deployment (Germany + Finland or France)
- PostgreSQL read replicas
- CDN for global performance (Cloudflare)
- Dedicated monitoring infrastructure

### 8.4 European Multi-Region Strategy

**Primary Region: Germany (Falkenstein)**
- API servers
- Primary PostgreSQL
- Object Storage
- Redis primary

**Secondary Region: Finland (Helsinki) or France (Paris)**
- API servers (read-only or full if needed)
- PostgreSQL replica
- Object Storage replication
- Redis replica

**Benefits:**
- Lower latency for Northern/Western Europe
- Disaster recovery
- Still 100% EU-hosted

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

**Application Metrics:**
- Request rate (requests/second)
- Error rate (errors/total requests)
- Response time (p50, p95, p99)
- Active users (DAU, MAU)

**Business Metrics:**
- Files uploaded per day
- Files viewed per day
- Emergency access usage
- Free-to-paid conversion rate
- Churn rate

**Infrastructure Metrics:**
- CPU/Memory usage (API servers)
- Database connections
- Object Storage usage
- Database query performance
- Network latency (EU vs US users)

### 9.2 Logging Strategy

**Log Levels:**
- `ERROR`: Application errors, exceptions
- `WARN`: Deprecated features, rate limiting triggered
- `INFO`: Significant events (login, file upload, emergency access)
- `DEBUG`: Detailed debugging (dev/staging only)

**Structured Logging:**
```json
{
  "level": "info",
  "timestamp": "2026-01-05T10:30:00Z",
  "userId": "uuid",
  "action": "FILE_UPLOAD",
  "fileId": "uuid",
  "sessionType": "OWNER",
  "ipAddress": "1.2.3.4",
  "dataResidency": "EU",
  "duration": 1250,
  "metadata": {
    "fileName": "passport.pdf",
    "fileSize": 1048576
  }
}
```

**Never Log:**
- Passwords (plaintext or hashed)
- Encryption keys
- Decrypted file content
- Unlock phrases
- 2FA codes
- Recovery codes

**Log Storage:**
- Self-hosted Loki on Hetzner (EU data residency)
- Or EU-based log service

### 9.3 Alerting

**Critical Alerts (Page immediately):**
- Error rate > 5%
- Database down
- API response time p95 > 2s
- Object Storage upload failures > 10%
- Hetzner datacenter outage

**Warning Alerts (Slack notification):**
- Error rate > 1%
- Disk usage > 80%
- CPU usage > 80% for 10 minutes
- Unusual spike in emergency access usage
- High latency for US users (p95 > 500ms)

---

## 10. Future Considerations

### 10.1 Technical Enhancements

1. **Native Mobile Apps**: React Native apps for iOS/Android
2. **Biometric Unlock**: Face ID / Touch ID for faster access
3. **Offline Access**: PWA with service workers, encrypted local storage
4. **Document OCR**: Extract text from scanned documents for better search
5. **Document Versioning**: Keep history of document updates
6. **Bulk Operations**: Upload/download multiple files at once
7. **Browser Extension**: Quick access from browser toolbar

### 10.2 Product Enhancements

1. **Family Vault**: Shared vault for couples/families
2. **Document Templates**: Pre-filled templates for wills, powers of attorney
3. **Professional Partnerships**: Integration with European estate planning attorneys
4. **Digital Legacy Planning**: Social media account instructions, digital asset inventory
5. **Scheduled Sharing**: Share document at future date (e.g., "give kids access when I turn 70")
6. **Video Messages**: "Message to loved ones" video recording
7. **Multi-language**: German, French, Dutch, Spanish, Italian support

### 10.3 European Expansion

1. **Additional EU Regions**:
   - Helsinki, Finland (low latency for Nordics)
   - Paris, France (Western Europe)
   - Amsterdam, Netherlands (backup)

2. **Local Payment Methods**:
   - SEPA Direct Debit
   - iDEAL (Netherlands)
   - Sofort (Germany)
   - Bancontact (Belgium)

3. **Compliance & Certifications**:
   - SOC 2 Type II
   - ISO 27001
   - GDPR certification seal
   - German "Trusted Cloud" certification

### 10.4 Privacy Enhancements

1. **Anonymous Accounts**: Option to sign up without email (use recovery codes only)
2. **Tor Support**: Onion service for maximum privacy
3. **Warrant Canary**: Transparency report on government requests
4. **Open Source Crypto**: Open source the encryption module for auditing

---

## 11. European Data Sovereignty Strategy

### 11.1 Legal & Compliance

**GDPR Compliance:**
- Data Processing Agreement (DPA) with all vendors
- Right to access: Users can export all data
- Right to erasure: Account deletion purges all data
- Right to portability: Export in standard formats
- Data breach notification: 72-hour SLA

**Data Protection Officer:**
- Appoint DPO (required if processing sensitive data at scale)
- Contact: dpo@legacyshield.com

**Privacy Policy Highlights:**
- "Your data is stored exclusively on servers located in Germany"
- "We never transfer data outside the European Union"
- "Your encrypted files cannot be accessed by Legacy Shield employees"
- "We comply with GDPR and German BDSG (Federal Data Protection Act)"

### 11.2 Marketing European Hosting

**Trust Badges:**
- "🇪🇺 100% European Hosting"
- "🔒 GDPR Native"
- "🇩🇪 Hosted in Germany"
- "🚫 No US Jurisdiction"

**Comparison Table (vs US competitors):**

| Feature | Legacy Shield | Dropbox | Google Drive |
|---------|---------------|---------|--------------|
| Data Location | 🇪🇺 Germany Only | 🇺🇸 US Servers | 🇺🇸 US Servers |
| GDPR Native | ✅ Yes | ⚠️ Compliant | ⚠️ Compliant |
| Subject to CLOUD Act | ❌ No | ✅ Yes | ✅ Yes |
| Zero-Knowledge | ✅ Yes | ❌ No | ❌ No |
| Emergency Access | ✅ Built-in | ❌ No | ❌ No |

**Homepage Messaging:**
> "Your legacy. Your privacy. Your Europe.
>
> Store your most critical documents on servers that never leave European soil. Protected by the world's strongest privacy laws. Accessible to your loved ones when it matters most."

### 11.3 Vendor Selection (EU-only)

**Current Stack (All EU):**
- ✅ Hetzner (Germany) - Infrastructure
- ✅ Plausible (EU) - Analytics
- ✅ Resend (EU option) - Email
- ⚠️ Stripe (US company, but EU entity) - Payments
- ⚠️ GitHub (US, Microsoft) - Code hosting

**Future Considerations:**
- Replace GitHub with GitLab (EU-based)?
- Use Mollie (Netherlands) instead of Stripe for EU-specific payment methods

---

## Appendix A: Technology Decisions

### Why Client-Side Encryption?

**Pros:**
- Maximum security: Server never sees plaintext
- Trustless architecture: Users don't have to trust us with sensitive data
- Differentiation: Most competitors (Dropbox, Google Drive) don't offer this
- Compliance: Easier GDPR/privacy compliance
- Marketing: "Even we can't read your documents"

**Cons:**
- Complexity: More difficult to implement correctly
- Password recovery: Can't recover if user forgets password
- Search limitations: Can't do server-side full-text search on encrypted files
- Performance: Encryption/decryption adds overhead

**Decision**: Pros outweigh cons for our use case (critical documents, privacy-focused users)

### Why PostgreSQL?

**Alternatives Considered:**
- MongoDB: NoSQL, but we have relational data (users ↔ files ↔ emergency contacts)
- MySQL: Similar to PostgreSQL, but PostgreSQL has better JSON support

**Decision**: PostgreSQL for strong ACID guarantees, excellent performance, mature ecosystem

### Why Hetzner Object Storage?

**Alternatives Considered:**
- AWS S3: Mature, but US company, subject to CLOUD Act, more expensive
- Scaleway (France): Good EU alternative, S3-compatible
- Exoscale (Switzerland): Strong privacy (Swiss jurisdiction), more expensive
- Self-hosted MinIO: Maximum control, but operational overhead

**Decision**: Hetzner for:
- German company (strong privacy reputation)
- S3-compatible API (easy migration path)
- Extremely cost-effective (€0.0052/GB vs AWS $0.023/GB)
- Same datacenter as compute (low latency)
- No egress fees within EU

### Why Next.js?

**Alternatives Considered:**
- Create React App: Simpler, but no SSR
- Remix: Great, but smaller ecosystem
- SvelteKit: Excellent performance, but smaller talent pool
- Astro: Good for static sites, but we need dynamic app

**Decision**: Next.js for best-in-class DX, SSR/SSG flexibility, large ecosystem, production-ready

### Why European-Only Hosting?

**Business Rationale:**
1. **Differentiation**: No competitor offers EU-exclusive critical document storage
2. **Privacy positioning**: Appeals to GDPR-conscious users (growing market)
3. **Trust**: European privacy laws stronger than US
4. **Marketing**: Clear, simple message: "Your data never leaves Europe"
5. **Cost**: Hetzner is cheaper than AWS/GCP/Azure

**Challenges:**
- Higher latency for US users (~150-200ms vs ~50ms on US servers)
- Smaller ecosystem (fewer EU-specific SaaS options)
- Some vendors (Stripe, GitHub) still US-based

**Mitigation:**
- Use CDN (Cloudflare) for static assets
- Optimize API performance
- Accept US latency tradeoff for privacy positioning
- Choose EU vendors where possible, audit US vendors for GDPR

**Decision**: European hosting is a core differentiator and aligns with privacy-first values

---

## Appendix B: Security Checklist

- [ ] All communication over HTTPS (TLS 1.3)
- [ ] Client-side encryption before upload
- [ ] 2FA mandatory for all users
- [ ] Rate limiting on all endpoints
- [ ] CSRF protection
- [ ] XSS protection (CSP headers, React auto-escaping)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] Secure session management (httpOnly cookies)
- [ ] Password requirements enforced
- [ ] Audit logging for all sensitive operations
- [ ] Regular dependency updates (Dependabot)
- [ ] Secrets stored in environment variables (never committed)
- [ ] Input validation on all API endpoints (Zod)
- [ ] Output encoding to prevent XSS
- [ ] File upload validation (type, size)
- [ ] No sensitive data in logs
- [ ] Error messages don't leak implementation details
- [ ] Security headers (Helmet.js)
- [ ] Regular security audits
- [ ] Penetration testing before launch
- [ ] GDPR compliance (DPA, privacy policy, user rights)
- [ ] Data residency verified (100% EU)
- [ ] Vendor audit (ensure all vendors EU-compliant)

---

## Appendix C: Hetzner Setup Guide

### Initial Server Setup

```bash
# 1. Create Hetzner Cloud project
# 2. Deploy servers via Hetzner Cloud Console or CLI

# Install Docker on API servers
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 3. Set up Hetzner Object Storage
# - Create bucket: legacy-shield-vault-eu
# - Generate access keys
# - Configure CORS for upload

# 4. Set up Hetzner Managed PostgreSQL
# - Create database instance
# - Configure firewall (allow only API server IPs)
# - Enable automated backups

# 5. Configure Load Balancer
# - Add API servers as targets
# - Configure health check: GET /health
# - Enable TLS with Let's Encrypt certificate

# 6. Deploy application
git clone https://github.com/yourorg/legacy-shield
cd legacy-shield
docker-compose -f docker-compose.prod.yml up -d
```

---

**End of Technical Architecture Specification**
