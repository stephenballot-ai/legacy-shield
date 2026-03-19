# BitAtlas — Technical RFC

**RFC:** 001
**Title:** BitAtlas: Zero-Knowledge Encrypted Storage for AI Agents
**Date:** 2026-03-15
**Authors:** Stephen Ballot, Lobbi (AI)
**Status:** Draft
**Supersedes:** N/A

---

## 1. Abstract

This RFC specifies the architecture and technical design of BitAtlas, a zero-knowledge encrypted storage system purpose-built for AI agents. The system exposes storage primitives via the Model Context Protocol (MCP), REST API, and native SDKs. All data is encrypted client-side before transmission — the server never sees plaintext. The design supports multi-tenancy, cross-agent sharing via delegation tokens, immutable audit trails, and a migration path from LegacyShield's existing vault implementation.

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Side                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ MCP      │  │ Python   │  │ TypeScript│  │ REST      │  │
│  │ Client   │  │ SDK      │  │ SDK       │  │ Client    │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  │
│       │              │              │              │         │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐  │
│  │              Encryption Layer (Client-Side)            │  │
│  │  AES-256-GCM encryption/decryption                    │  │
│  │  HKDF key derivation from master key                  │  │
│  │  Per-object unique data encryption keys               │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │ Encrypted blobs + encrypted     │
│                           │ metadata only cross this line   │
└───────────────────────────┼─────────────────────────────────┘
                            │ TLS 1.3
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Server Side                           │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API Gateway                          │ │
│  │  Rate limiting · Auth · Request routing                │ │
│  └─────────┬──────────────────────┬───────────────────────┘ │
│            │                      │                         │
│  ┌─────────▼──────────┐  ┌───────▼───────────────────────┐ │
│  │   MCP Server       │  │   REST API Server             │ │
│  │   (SSE transport)  │  │   (HTTP/JSON)                 │ │
│  └─────────┬──────────┘  └───────┬───────────────────────┘ │
│            │                      │                         │
│  ┌─────────▼──────────────────────▼───────────────────────┐ │
│  │              Core Storage Service                      │ │
│  │  Blob management · Metadata ops · Access control       │ │
│  │  Delegation tokens · Versioning · Audit logging        │ │
│  └──────┬─────────────────┬──────────────────┬────────────┘ │
│         │                 │                  │              │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼──────────┐  │
│  │ Object      │  │ Metadata    │  │ Audit Log         │  │
│  │ Storage     │  │ Database    │  │ (Append-Only)     │  │
│  │ (S3/Minio)  │  │ (Postgres)  │  │ (Postgres)        │  │
│  └─────────────┘  └─────────────┘  └───────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

1. **Zero-knowledge is non-negotiable.** The server stores ciphertext and encrypted metadata. It cannot decrypt anything. This is enforced architecturally, not by policy.
2. **MCP is the primary interface.** REST is a fallback for environments that don't support MCP yet. SDKs wrap both.
3. **Encryption is the SDK's job.** The server is a dumb encrypted blob store. All crypto happens client-side in the SDK.
4. **Metadata is encrypted too.** File names, tags, and descriptions are encrypted before storage. The server only sees opaque bytes and system metadata (size, timestamps, tenant ID).
5. **Audit everything.** Every operation produces an immutable audit log entry. The content of the log entry referencing what was accessed is hashed, not stored in plaintext.

---

## 3. API Surface Design

### 3.1 Core Operations

All operations are available via both MCP tools and REST endpoints.

#### `vault.store`

Store an encrypted object in the vault.

```typescript
interface StoreRequest {
  // Client-provided unique ID (UUIDv7 recommended)
  object_id?: string;
  
  // Encrypted blob (base64-encoded ciphertext)
  data: string;
  
  // Encrypted metadata (base64-encoded ciphertext)
  // Contains: original filename, content type, tags, description
  encrypted_metadata: string;
  
  // Namespace for organization (plaintext, alphanumeric + slashes)
  namespace?: string;
  
  // Content hash (SHA-256 of plaintext, for dedup/integrity)
  content_hash: string;
  
  // Encrypted data encryption key (wrapped with user's master key)
  wrapped_dek: string;
  
  // Encryption algorithm identifier
  encryption_algo: "aes-256-gcm";
  
  // Nonce/IV used for encryption (base64)
  nonce: string;
}

interface StoreResponse {
  object_id: string;
  version: number;
  stored_at: string; // ISO 8601
  size_bytes: number;
  etag: string;
}
```

#### `vault.retrieve`

Retrieve an encrypted object.

```typescript
interface RetrieveRequest {
  object_id: string;
  version?: number; // Omit for latest
}

interface RetrieveResponse {
  object_id: string;
  version: number;
  data: string; // base64-encoded ciphertext
  encrypted_metadata: string;
  wrapped_dek: string;
  encryption_algo: string;
  nonce: string;
  content_hash: string;
  stored_at: string;
  size_bytes: number;
}
```

#### `vault.list`

List objects in the vault. Returns encrypted metadata — the client must decrypt to see file names/tags.

```typescript
interface ListRequest {
  namespace?: string;
  cursor?: string;
  limit?: number; // Default 50, max 200
}

interface ListResponse {
  objects: Array<{
    object_id: string;
    current_version: number;
    encrypted_metadata: string;
    wrapped_dek: string; // For metadata decryption
    encryption_algo: string;
    nonce: string;
    size_bytes: number;
    stored_at: string;
    updated_at: string;
  }>;
  cursor?: string; // For pagination
  total_count: number;
}
```

#### `vault.delete`

Soft-delete an object (hard delete after retention period).

```typescript
interface DeleteRequest {
  object_id: string;
  version?: number; // Omit to delete all versions
}

interface DeleteResponse {
  object_id: string;
  deleted_at: string;
  hard_delete_at: string; // When data will be permanently removed
}
```

#### `vault.share` (P1)

Create a delegation token for cross-agent access.

```typescript
interface ShareRequest {
  object_ids: string[]; // Objects to share
  permissions: ("read" | "write")[];
  expires_at: string; // ISO 8601, max 30 days
  
  // Re-encrypted DEK for the recipient
  // Client wraps the DEK with recipient's public key
  recipient_wrapped_deks: Record<string, string>;
  
  // Optional: restrict to specific agent identity
  agent_identity?: string;
}

interface ShareResponse {
  delegation_token: string;
  expires_at: string;
  object_ids: string[];
  permissions: string[];
}
```

#### `vault.revoke` (P1)

Revoke a delegation token.

```typescript
interface RevokeRequest {
  delegation_token: string;
}
```

#### `vault.versions` (P1)

List versions of an object.

```typescript
interface VersionsRequest {
  object_id: string;
  cursor?: string;
  limit?: number;
}

interface VersionsResponse {
  versions: Array<{
    version: number;
    stored_at: string;
    size_bytes: number;
    content_hash: string;
  }>;
  cursor?: string;
}
```

### 3.2 REST API Endpoints

```
POST   /v1/objects              → vault.store
GET    /v1/objects/:id          → vault.retrieve
GET    /v1/objects/:id?version= → vault.retrieve (specific version)
GET    /v1/objects               → vault.list
DELETE /v1/objects/:id          → vault.delete
POST   /v1/objects/:id/share   → vault.share
DELETE /v1/share/:token         → vault.revoke
GET    /v1/objects/:id/versions → vault.versions
GET    /v1/audit                → audit log
GET    /v1/usage                → usage stats
```

### 3.3 Error Codes

| Code | Meaning |
|------|---------|
| `OBJECT_NOT_FOUND` | Object doesn't exist or was deleted |
| `VERSION_NOT_FOUND` | Requested version doesn't exist |
| `QUOTA_EXCEEDED` | Storage or operation quota reached |
| `RATE_LIMITED` | Too many requests |
| `INVALID_TOKEN` | API key or delegation token invalid/expired |
| `PERMISSION_DENIED` | Token lacks required permission |
| `ENCRYPTION_MISMATCH` | Encryption algo not supported |
| `PAYLOAD_TOO_LARGE` | Object exceeds max size (100MB for MVP) |

---

## 4. Authentication & Authorization

### 4.1 API Keys (MVP)

Each user gets one or more API keys. Keys are scoped to a tenant (user account).

```
Authorization: Bearer av_live_k1_xxxxxxxxxxxxxxxxxxxxx
```

Key format: `av_{environment}_{version}_{random}`
- Environment: `live` or `test`
- Version: `k1` (allows future key format changes)
- Random: 32 bytes, base62-encoded

Keys are stored as SHA-256 hashes server-side. The plaintext key is shown once at creation.

### 4.2 Agent Identity (P1)

Agents can optionally register an identity for fine-grained access control:

```typescript
interface AgentIdentity {
  agent_id: string; // Unique agent identifier
  name: string;
  framework?: string; // "langchain", "crewai", "autogen", "custom"
  permissions: Permission[];
  namespaces: string[]; // Allowed namespaces
}
```

Agent identity is asserted via a signed JWT issued by the SDK:

```
X-Agent-Identity: eyJhbGciOiJFZERTQSJ9...
```

The JWT is signed with an Ed25519 key pair generated per agent. The public key is registered with BitAtlas. This allows:
- Per-agent audit trails
- Namespace-level access control
- Agent-scoped delegation tokens

### 4.3 Delegation Tokens (P1)

For cross-agent sharing. A delegation token is a signed, scoped JWT:

```json
{
  "iss": "bitatlas",
  "sub": "tenant_xxxx",
  "aud": "agent_yyyy",
  "object_ids": ["obj_1", "obj_2"],
  "permissions": ["read"],
  "exp": 1711100000,
  "iat": 1711000000,
  "jti": "dt_unique_id"
}
```

Usage:
```
Authorization: Bearer av_live_k1_xxxxx
X-Delegation-Token: eyJhbGciOi...
```

The token grants the bearer access to the specified objects with the specified permissions, until expiry or revocation.

### 4.4 Auth Flow Summary

```
Agent Request
    │
    ▼
┌─────────────────┐
│ Validate API Key │──── Invalid ──→ 401
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────────┐
│ Check Agent Identity │──── Optional (P1)
│ (if X-Agent-Identity)│
└────────┬────────────┘
         │
         ▼
┌──────────────────────┐
│ Check Delegation      │──── If accessing another tenant's objects
│ Token (if present)    │──── Invalid/expired ──→ 403
└────────┬─────────────┘
         │ Authorized
         ▼
   Process Request
```

---

## 5. Encryption Scheme

### 5.1 Overview

BitAtlas uses a three-layer key hierarchy:

```
Master Key (user-held, never transmitted)
    │
    ├─── HKDF ──→ Metadata Encryption Key (MEK)
    │              Used to encrypt object metadata
    │
    └─── Per-object:
         ├─── Random DEK (Data Encryption Key)
         │    Generated per object, per version
         │    Used for AES-256-GCM encryption of content
         │
         └─── Wrapped DEK
              DEK encrypted with Master Key via AES-256-KWP
              Stored server-side (server can't unwrap without Master Key)
```

### 5.2 Key Derivation

**Master Key Generation:**
```
master_key = HKDF-SHA256(
  ikm: user_passphrase | random_bytes(32),
  salt: random_bytes(32),  // stored in user profile
  info: "bitatlas-master-key-v1",
  length: 32
)
```

For API-key-only auth (no passphrase), the master key is generated randomly and must be stored by the client. The SDK persists it in a local keychain/config file.

**Metadata Encryption Key:**
```
mek = HKDF-SHA256(
  ikm: master_key,
  salt: tenant_id_bytes,
  info: "bitatlas-metadata-key-v1",
  length: 32
)
```

**Data Encryption Key (per object):**
```
dek = random_bytes(32)  // Fresh random key per object/version
```

### 5.3 Encryption Process

**Storing an object:**

```
1. Generate random DEK (32 bytes)
2. Generate random nonce (12 bytes for AES-256-GCM)
3. Encrypt plaintext:
   ciphertext, tag = AES-256-GCM(key=dek, nonce=nonce, plaintext=data, aad=object_id)
4. Wrap DEK:
   wrapped_dek = AES-256-KWP(key=master_key, plaintext=dek)
5. Encrypt metadata:
   encrypted_metadata = AES-256-GCM(key=mek, nonce=random(12), plaintext=json(metadata), aad=object_id)
6. Compute content hash:
   content_hash = SHA-256(plaintext)
7. Send to server:
   { ciphertext, encrypted_metadata, wrapped_dek, nonce, content_hash, encryption_algo }
```

**Retrieving an object:**

```
1. Receive from server:
   { ciphertext, encrypted_metadata, wrapped_dek, nonce, encryption_algo }
2. Unwrap DEK:
   dek = AES-256-KWP-unwrap(key=master_key, ciphertext=wrapped_dek)
3. Decrypt data:
   plaintext = AES-256-GCM-decrypt(key=dek, nonce=nonce, ciphertext=data, aad=object_id)
4. Verify integrity:
   assert SHA-256(plaintext) == content_hash
5. Decrypt metadata:
   metadata = AES-256-GCM-decrypt(key=mek, nonce=meta_nonce, ciphertext=encrypted_metadata, aad=object_id)
```

### 5.4 Zero-Knowledge Proof

The server can verify it has a valid encrypted blob without knowing the contents:

1. **Integrity:** Content hash (SHA-256 of plaintext) is provided by client. Server stores it but can't verify it without plaintext — this is by design. The hash is for client-side integrity verification after decryption.
2. **Authenticity:** AES-256-GCM's authentication tag ensures tamper detection. If server-side storage corrupts data, the client will detect it on decryption.
3. **Non-repudiation:** Audit log entries include a hash of the operation parameters. Combined with the client's content hash, this creates a verifiable chain.

The server provably cannot:
- Read object contents (no access to DEK or master key)
- Read metadata (no access to MEK)
- Modify data without detection (GCM authentication tag)
- Associate objects with their plaintext names/types (metadata is encrypted)

### 5.5 Key Management for Sharing (P1)

When sharing objects with another agent:

```
1. Sharer retrieves recipient's public key (X25519)
2. Sharer unwraps DEK with their master key
3. Sharer re-wraps DEK with recipient's public key:
   shared_wrapped_dek = X25519-XSalsa20-Poly1305(
     recipient_public_key, 
     sharer_private_key, 
     dek
   )
4. Shared wrapped DEK is included in the delegation token
5. Recipient unwraps DEK with their private key
```

This means the server never sees the plaintext DEK during sharing.

---

## 6. MCP Server Specification

### 6.1 Server Identity

```json
{
  "name": "bitatlas",
  "version": "1.0.0",
  "description": "Zero-knowledge encrypted storage for AI agents"
}
```

### 6.2 Tools

#### `vault_store`

```json
{
  "name": "vault_store",
  "description": "Store a file or data blob in the encrypted vault. Data is encrypted client-side before storage — the server never sees plaintext.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "content": {
        "type": "string",
        "description": "The content to store. Can be text, base64-encoded binary, or a JSON object."
      },
      "filename": {
        "type": "string",
        "description": "Name for the stored object (e.g., 'meeting-notes.md', 'analysis.json')"
      },
      "content_type": {
        "type": "string",
        "description": "MIME type (e.g., 'text/plain', 'application/json', 'application/pdf')"
      },
      "namespace": {
        "type": "string",
        "description": "Optional namespace for organization (e.g., 'project-alpha/reports')"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Optional tags for categorization"
      },
      "description": {
        "type": "string",
        "description": "Optional human-readable description"
      }
    },
    "required": ["content", "filename"]
  }
}
```

Note: The MCP tool accepts plaintext. The SDK/MCP client handles encryption transparently before the data reaches the wire. The agent never needs to think about encryption.

#### `vault_retrieve`

```json
{
  "name": "vault_retrieve",
  "description": "Retrieve a file or data blob from the encrypted vault by ID or filename.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "object_id": {
        "type": "string",
        "description": "The object ID to retrieve"
      },
      "filename": {
        "type": "string",
        "description": "The filename to search for (returns latest match)"
      },
      "version": {
        "type": "integer",
        "description": "Specific version to retrieve (omit for latest)"
      }
    }
  }
}
```

#### `vault_list`

```json
{
  "name": "vault_list",
  "description": "List objects stored in the vault. Returns filenames, sizes, and metadata.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "namespace": {
        "type": "string",
        "description": "Filter by namespace"
      },
      "tag": {
        "type": "string",
        "description": "Filter by tag"
      },
      "limit": {
        "type": "integer",
        "description": "Max results to return (default 20)"
      }
    }
  }
}
```

#### `vault_delete`

```json
{
  "name": "vault_delete",
  "description": "Delete an object from the vault.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "object_id": {
        "type": "string",
        "description": "The object ID to delete"
      },
      "filename": {
        "type": "string",
        "description": "The filename to delete"
      }
    }
  }
}
```

#### `vault_share` (P1)

```json
{
  "name": "vault_share",
  "description": "Share vault objects with another agent via a delegation token.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "object_ids": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Object IDs to share"
      },
      "permissions": {
        "type": "array",
        "items": { "enum": ["read", "write"] },
        "description": "Permissions to grant"
      },
      "expires_in": {
        "type": "string",
        "description": "Duration (e.g., '1h', '7d', '30d')"
      },
      "recipient_agent_id": {
        "type": "string",
        "description": "Optional: restrict to specific agent"
      }
    },
    "required": ["object_ids", "permissions", "expires_in"]
  }
}
```

### 6.3 Resources

```json
{
  "resources": [
    {
      "uri": "vault://objects",
      "name": "Vault Objects",
      "description": "List of all objects in the vault",
      "mimeType": "application/json"
    },
    {
      "uri": "vault://objects/{object_id}",
      "name": "Vault Object",
      "description": "A specific object from the vault",
      "mimeType": "application/octet-stream"
    },
    {
      "uri": "vault://usage",
      "name": "Vault Usage",
      "description": "Current storage usage and quota",
      "mimeType": "application/json"
    }
  ]
}
```

### 6.4 Prompts

```json
{
  "prompts": [
    {
      "name": "vault_save_context",
      "description": "Save the current conversation context to the vault for future reference",
      "arguments": [
        {
          "name": "summary",
          "description": "Brief summary of what to save",
          "required": true
        }
      ]
    },
    {
      "name": "vault_recall",
      "description": "Recall previously stored context relevant to the current conversation",
      "arguments": [
        {
          "name": "topic",
          "description": "Topic or keywords to search for",
          "required": true
        }
      ]
    }
  ]
}
```

### 6.5 Transport

- **Primary:** SSE (Server-Sent Events) — the default MCP transport
- **Alternative:** Streamable HTTP — for environments that can't maintain SSE connections
- **Connection URL:** `https://vault.agentvault.dev/mcp`

---

## 7. Storage Backend

### 7.1 Object Storage

Encrypted blobs are stored in S3-compatible object storage.

**MVP:** AWS S3 (eu-west-1) or Cloudflare R2 (EU region)
**Recommendation:** Cloudflare R2 — no egress fees, S3-compatible API, EU data residency option

**Object key structure:**
```
/{tenant_id}/{object_id}/{version}
```

**S3 configuration:**
- Server-side encryption: AES-256 (defense in depth — data is already client-encrypted)
- Versioning: Disabled at S3 level (we manage versions in metadata DB)
- Lifecycle: Hard-delete soft-deleted objects after retention period
- Cross-region replication: Not for MVP, P2 for enterprise

### 7.2 Metadata Database

PostgreSQL stores encrypted metadata and system state.

**Schema (core tables):**

```sql
-- Tenants (user accounts)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_ulid(),
  external_id TEXT UNIQUE NOT NULL,  -- Links to auth provider
  plan TEXT NOT NULL DEFAULT 'free',
  storage_quota_bytes BIGINT NOT NULL DEFAULT 104857600, -- 100MB
  ops_quota_monthly INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_ulid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  key_hash TEXT NOT NULL,  -- SHA-256 of the API key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  name TEXT,
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Objects (encrypted metadata only)
CREATE TABLE objects (
  id UUID PRIMARY KEY DEFAULT gen_ulid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  namespace TEXT DEFAULT '/',
  current_version INT NOT NULL DEFAULT 1,
  encrypted_metadata BYTEA NOT NULL,
  metadata_nonce BYTEA NOT NULL,
  wrapped_dek BYTEA NOT NULL,
  encryption_algo TEXT NOT NULL DEFAULT 'aes-256-gcm',
  size_bytes BIGINT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- Soft delete
  hard_delete_at TIMESTAMPTZ,
  
  UNIQUE(tenant_id, id)
);

CREATE INDEX idx_objects_tenant_namespace ON objects(tenant_id, namespace) 
  WHERE deleted_at IS NULL;

-- Object Versions
CREATE TABLE object_versions (
  id UUID PRIMARY KEY DEFAULT gen_ulid(),
  object_id UUID NOT NULL REFERENCES objects(id),
  version INT NOT NULL,
  storage_key TEXT NOT NULL,  -- S3 key
  encrypted_metadata BYTEA NOT NULL,
  metadata_nonce BYTEA NOT NULL,
  wrapped_dek BYTEA NOT NULL,
  nonce BYTEA NOT NULL,
  encryption_algo TEXT NOT NULL DEFAULT 'aes-256-gcm',
  size_bytes BIGINT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(object_id, version)
);

-- Delegation Tokens (P1)
CREATE TABLE delegation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_ulid(),
  token_hash TEXT NOT NULL,
  grantor_tenant_id UUID NOT NULL REFERENCES tenants(id),
  grantee_agent_id TEXT,
  object_ids UUID[] NOT NULL,
  permissions TEXT[] NOT NULL,
  recipient_wrapped_deks JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Audit Log (append-only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_ulid(),
  tenant_id UUID NOT NULL,
  api_key_id UUID,
  agent_id TEXT,
  operation TEXT NOT NULL,  -- 'store', 'retrieve', 'delete', 'share', 'revoke'
  object_id UUID,
  version INT,
  metadata_hash TEXT,  -- SHA-256 of operation params (no plaintext)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partition audit log by month for performance
CREATE INDEX idx_audit_tenant_time ON audit_log(tenant_id, created_at DESC);
```

### 7.3 LegacyShield Migration Path

LegacyShield's current vault stores encrypted files for digital legacy purposes. The migration:

**Phase 1: Abstract (Weeks 1–4)**
- Extract the storage interface from LegacyShield into a shared library
- LegacyShield continues using its existing storage but through the new interface
- No user-facing changes

**Phase 2: Dual-Write (Weeks 5–8)**
- New objects are written to both old and new storage
- Read from old storage, verify against new
- Build confidence in the new system

**Phase 3: Switch (Weeks 9–12)**
- Read from new storage, fall back to old
- Migrate existing objects in background
- LegacyShield becomes a client of BitAtlas

**Phase 4: Cleanup (Weeks 13–16)**
- Remove old storage code
- LegacyShield is now fully on BitAtlas
- Old storage decommissioned after verification period

**Key constraint:** LegacyShield users must not experience any downtime or data loss during migration. The dual-write phase ensures this.

---

## 8. Multi-Tenancy & Isolation

### 8.1 Tenant Isolation Model

```
Tenant A                    Tenant B
┌──────────────────┐       ┌──────────────────┐
│ API Key(s)       │       │ API Key(s)       │
│ Objects          │       │ Objects          │
│ Namespaces       │       │ Namespaces       │
│ Audit Log        │       │ Audit Log        │
│ Delegation Tokens│       │ Delegation Tokens│
└──────────────────┘       └──────────────────┘
         │                          │
         │   All queries filtered   │
         │   by tenant_id           │
         ▼                          ▼
┌─────────────────────────────────────────────┐
│          Shared Infrastructure              │
│   PostgreSQL (RLS) · S3 (prefix isolation)  │
└─────────────────────────────────────────────┘
```

### 8.2 Isolation Mechanisms

1. **Database:** Row-Level Security (RLS) on all tables. Every query is scoped to `tenant_id`. Even if application code has a bug, RLS prevents cross-tenant data access.

```sql
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON objects
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

2. **Object Storage:** Tenant ID is the top-level prefix in S3 keys. IAM policies prevent cross-prefix access at the S3 level.

3. **API Keys:** Keys are scoped to exactly one tenant. A key cannot access another tenant's data (except via delegation tokens, which are explicitly granted).

4. **Encryption:** Even if isolation fails, data is encrypted with tenant-specific keys. Cross-tenant data access yields only ciphertext.

### 8.3 Enterprise Isolation (P2)

For enterprise customers requiring stronger isolation:
- **Dedicated database schemas** (separate PostgreSQL schema per tenant)
- **Dedicated S3 buckets** (separate bucket per tenant)
- **Dedicated infrastructure** (separate compute + storage per tenant)

---

## 9. SDK Design

### 9.1 TypeScript SDK

```typescript
import { BitAtlas } from '@bitatlas/sdk';

// Initialize
const vault = new BitAtlas({
  apiKey: 'av_live_k1_xxxxx',
  masterKey: 'base64-encoded-master-key', // Or auto-generated and stored
  endpoint: 'https://vault.agentvault.dev', // Optional, defaults to production
});

// Store
const obj = await vault.store({
  content: 'Meeting notes from 2026-03-15...',
  filename: 'meeting-notes-2026-03-15.md',
  contentType: 'text/markdown',
  namespace: 'meetings',
  tags: ['q1-2026', 'product'],
});
console.log(obj.id); // "obj_01JXXXXXX"

// Store binary
const pdfObj = await vault.store({
  content: pdfBuffer, // Buffer or Uint8Array
  filename: 'report.pdf',
  contentType: 'application/pdf',
});

// Retrieve
const retrieved = await vault.retrieve(obj.id);
console.log(retrieved.content); // Decrypted plaintext
console.log(retrieved.metadata.filename); // "meeting-notes-2026-03-15.md"

// List
const objects = await vault.list({ namespace: 'meetings', tag: 'q1-2026' });
for (const o of objects) {
  console.log(o.metadata.filename, o.sizeBytes);
}

// Delete
await vault.delete(obj.id);

// Share (P1)
const token = await vault.share({
  objectIds: [obj.id],
  permissions: ['read'],
  expiresIn: '7d',
  recipientPublicKey: 'base64-encoded-x25519-public-key',
});

// MCP Integration
import { BitAtlasMCP } from '@bitatlas/mcp';

const mcpServer = new BitAtlasMCP({
  apiKey: 'av_live_k1_xxxxx',
  masterKey: 'base64-encoded-master-key',
});

// Connects to MCP-compatible agent frameworks
await mcpServer.start({ transport: 'sse', port: 3001 });
```

### 9.2 Python SDK

```python
from bitatlas import BitAtlas

# Initialize
vault = BitAtlas(
    api_key="av_live_k1_xxxxx",
    master_key="base64-encoded-master-key",
)

# Store
obj = vault.store(
    content="Meeting notes from 2026-03-15...",
    filename="meeting-notes-2026-03-15.md",
    content_type="text/markdown",
    namespace="meetings",
    tags=["q1-2026", "product"],
)

# Store binary
with open("report.pdf", "rb") as f:
    pdf_obj = vault.store(
        content=f.read(),
        filename="report.pdf",
        content_type="application/pdf",
    )

# Retrieve
retrieved = vault.retrieve(obj.id)
print(retrieved.content)  # Decrypted plaintext

# List
for o in vault.list(namespace="meetings"):
    print(o.metadata.filename, o.size_bytes)

# Delete
vault.delete(obj.id)

# Async support
from bitatlas import AsyncBitAtlas

async_vault = AsyncBitAtlas(api_key="...", master_key="...")
obj = await async_vault.store(content="...", filename="notes.md")
```

### 9.3 Framework Adapters (P1)

#### LangChain

```python
from bitatlas.integrations.langchain import BitAtlasStorage

storage = BitAtlasStorage(api_key="...", master_key="...")

# Use as document loader
docs = storage.load(namespace="research-papers")

# Use as document store
storage.add_documents(docs, namespace="processed")

# Use as chat history backend
from bitatlas.integrations.langchain import BitAtlasChatHistory

history = BitAtlasChatHistory(
    vault=storage,
    session_id="conv-123",
)
```

#### CrewAI

```python
from bitatlas.integrations.crewai import BitAtlasTool

vault_tool = BitAtlasTool(api_key="...", master_key="...")

# Add to crew
crew = Crew(
    agents=[researcher, writer],
    tools=[vault_tool],  # All agents can store/retrieve
)
```

#### AutoGen

```python
from bitatlas.integrations.autogen import BitAtlasPlugin

vault_plugin = BitAtlasPlugin(api_key="...", master_key="...")

assistant = AssistantAgent(
    "assistant",
    llm_config=llm_config,
    plugins=[vault_plugin],
)
```

---

## 10. Rate Limiting & Quotas

### 10.1 Rate Limits

| Plan | Requests/min | Requests/hour | Burst |
|------|-------------|---------------|-------|
| Free | 30 | 500 | 10 |
| Pro | 300 | 5,000 | 50 |
| Team | 1,000 | 20,000 | 100 |
| Enterprise | Custom | Custom | Custom |

Rate limiting is implemented via a sliding window counter in Redis.

Response headers:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1711000060
Retry-After: 3  (only on 429)
```

### 10.2 Storage Quotas

| Plan | Storage | Objects | Max Object Size | Versions per Object |
|------|---------|---------|-----------------|---------------------|
| Free | 100 MB | 1,000 | 10 MB | 1 (no versioning) |
| Pro | 10 GB | 100,000 | 100 MB | 30 |
| Team | 100 GB | 1,000,000 | 500 MB | 100 |
| Enterprise | Custom | Custom | 5 GB | Custom |

### 10.3 Operation Quotas

| Plan | Operations/month |
|------|-----------------|
| Free | 1,000 |
| Pro | 50,000 |
| Team | 500,000 |
| Enterprise | Unlimited |

An "operation" is any API call that reads or writes data (store, retrieve, delete, share). List and usage queries don't count.

---

## 11. Compliance Considerations

### 11.1 GDPR

BitAtlas is designed to be GDPR-compliant by architecture:

- **Data minimization:** We store only encrypted blobs and system metadata. We can't read user data.
- **Right to erasure:** `vault.delete` with immediate hard-delete option. We also provide a "nuke my account" endpoint that deletes all data and keys.
- **Data portability:** Export endpoint returns all encrypted blobs + wrapped DEKs. User can decrypt locally.
- **Data residency:** EU-hosted infrastructure (primary). User can choose region.
- **DPA:** Standard Data Processing Agreement available for all paid plans.
- **Lawful basis:** Contractual necessity (user explicitly stores data).

**Zero-knowledge advantage:** In a GDPR context, zero-knowledge encryption means we're technically not a "data processor" for the content — we can't process what we can't read. Legal counsel should confirm this interpretation per jurisdiction.

### 11.2 SOC2 Path (P2)

Target: SOC2 Type II certification within 18 months of launch.

**Controls already in place (by design):**
- Encryption at rest and in transit
- Access controls (API keys, RLS, tenant isolation)
- Audit logging (immutable, complete)
- Availability monitoring

**Controls to implement:**
- Formal security policies and procedures
- Employee background checks and access reviews
- Penetration testing (annual)
- Incident response plan
- Business continuity / disaster recovery plan
- Vendor management program

**Estimated cost:** €30–50K for audit + preparation
**Timeline:** Start preparation at €10K MRR, complete by €20K MRR

### 11.3 HIPAA (P2)

For healthcare AI agents. Requires:
- Business Associate Agreement (BAA)
- Additional audit controls
- Breach notification procedures
- Dedicated infrastructure option

Zero-knowledge encryption is a massive advantage here — ePHI is encrypted before it reaches our servers.

### 11.4 EU AI Act

The EU AI Act may classify AI agent storage providers as part of the AI value chain. Key considerations:
- Transparency about what data flows through the system
- Risk classification of AI systems using BitAtlas
- Record-keeping requirements

**Action:** Get legal review before public launch. The zero-knowledge architecture may exempt us from many obligations since we can't inspect the data.

---

## 12. Sequence Diagrams

### 12.1 Store Object

```mermaid
sequenceDiagram
    participant Agent
    participant SDK
    participant API as BitAtlas API
    participant S3 as Object Storage
    participant DB as Metadata DB
    participant Audit as Audit Log

    Agent->>SDK: store(content, filename, tags)
    
    Note over SDK: Generate random DEK (32 bytes)
    Note over SDK: Generate random nonce (12 bytes)
    Note over SDK: Encrypt content with AES-256-GCM(DEK)
    Note over SDK: Wrap DEK with master key (AES-256-KWP)
    Note over SDK: Encrypt metadata with MEK
    Note over SDK: Compute SHA-256(plaintext)
    
    SDK->>API: POST /v1/objects<br/>{ciphertext, encrypted_metadata,<br/>wrapped_dek, nonce, content_hash}
    
    API->>API: Validate API key
    API->>API: Check quota (storage + ops)
    API->>DB: Insert object record
    API->>S3: PUT /{tenant_id}/{object_id}/1
    API->>Audit: INSERT audit entry (store, object_id)
    
    API-->>SDK: 201 {object_id, version: 1, stored_at}
    SDK-->>Agent: StoreResult {id, version, storedAt}
```

### 12.2 Retrieve Object

```mermaid
sequenceDiagram
    participant Agent
    participant SDK
    participant API as BitAtlas API
    participant S3 as Object Storage
    participant DB as Metadata DB
    participant Audit as Audit Log

    Agent->>SDK: retrieve(object_id)
    
    SDK->>API: GET /v1/objects/{object_id}
    
    API->>API: Validate API key + tenant access
    API->>DB: SELECT object metadata
    API->>S3: GET /{tenant_id}/{object_id}/{version}
    API->>Audit: INSERT audit entry (retrieve, object_id)
    
    API-->>SDK: 200 {ciphertext, encrypted_metadata,<br/>wrapped_dek, nonce}
    
    Note over SDK: Unwrap DEK with master key
    Note over SDK: Decrypt content with AES-256-GCM(DEK)
    Note over SDK: Verify SHA-256(plaintext) == content_hash
    Note over SDK: Decrypt metadata with MEK
    
    SDK-->>Agent: RetrieveResult {content, metadata}
```

### 12.3 Cross-Agent Sharing (P1)

```mermaid
sequenceDiagram
    participant AgentA as Agent A (Sharer)
    participant SDKA as SDK A
    participant API as BitAtlas API
    participant SDKB as SDK B
    participant AgentB as Agent B (Recipient)

    Note over AgentA: Wants to share object with Agent B
    
    AgentA->>SDKA: share(object_ids, recipient_public_key, expires_in)
    
    Note over SDKA: Unwrap DEK with A's master key
    Note over SDKA: Re-wrap DEK with B's X25519 public key
    
    SDKA->>API: POST /v1/objects/{id}/share<br/>{recipient_wrapped_deks, permissions, expires_at}
    
    API->>API: Create delegation token
    API->>API: Store token record
    
    API-->>SDKA: 201 {delegation_token}
    SDKA-->>AgentA: ShareResult {token}
    
    Note over AgentA: Transmits token to Agent B (out of band)
    
    AgentB->>SDKB: retrieve(object_id, delegation_token)
    
    SDKB->>API: GET /v1/objects/{id}<br/>Authorization: Bearer {api_key}<br/>X-Delegation-Token: {token}
    
    API->>API: Validate delegation token
    API->>API: Check permissions + expiry
    API->>API: Retrieve encrypted object
    
    API-->>SDKB: 200 {ciphertext, recipient_wrapped_dek, nonce}
    
    Note over SDKB: Unwrap DEK with B's private key
    Note over SDKB: Decrypt content
    
    SDKB-->>AgentB: RetrieveResult {content, metadata}
```

### 12.4 MCP Tool Invocation

```mermaid
sequenceDiagram
    participant LLM as LLM (Claude, GPT, etc.)
    participant Framework as Agent Framework
    participant MCP as BitAtlas MCP Server
    participant SDK as Encryption Layer
    participant API as BitAtlas API

    LLM->>Framework: Tool call: vault_store<br/>{content: "notes...", filename: "notes.md"}
    
    Framework->>MCP: MCP tool invocation: vault_store
    
    MCP->>SDK: store(plaintext_content, metadata)
    
    Note over SDK: Client-side encryption<br/>(same as direct SDK flow)
    
    SDK->>API: POST /v1/objects {ciphertext, ...}
    API-->>SDK: 201 {object_id, version}
    
    SDK-->>MCP: StoreResult
    
    MCP-->>Framework: MCP tool result:<br/>"Stored 'notes.md' (id: obj_xxx, 2.3KB)"
    
    Framework-->>LLM: Tool result message
    
    LLM->>LLM: "I've saved the meeting notes<br/>to the vault as 'notes.md'"
```

### 12.5 LegacyShield Migration (Dual-Write Phase)

```mermaid
sequenceDiagram
    participant User as LegacyShield User
    participant LS as LegacyShield App
    participant Old as Old Storage
    participant AV as BitAtlas SDK
    participant New as BitAtlas API

    User->>LS: Upload document to vault
    
    LS->>Old: Store (existing flow)
    Old-->>LS: OK
    
    LS->>AV: store(content, filename, ...)
    
    Note over AV: Encrypt with BitAtlas scheme
    
    AV->>New: POST /v1/objects
    New-->>AV: 201 {object_id}
    AV-->>LS: OK (logged, non-blocking)
    
    LS-->>User: Document stored ✓
    
    Note over LS: On read: fetch from Old,<br/>verify against New (async)
```

---

## 13. Infrastructure & Deployment

### 13.1 MVP Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| API Server | Node.js (Hono) or Rust (Axum) | Hono for speed-to-market, Rust if perf is critical |
| MCP Server | TypeScript (MCP SDK) | Official MCP SDK is TypeScript |
| Object Storage | Cloudflare R2 | No egress fees, S3-compatible, EU region |
| Metadata DB | Neon PostgreSQL | Serverless Postgres, generous free tier, scales well |
| Cache / Rate Limit | Upstash Redis | Serverless Redis, per-request pricing |
| Auth | Custom (API keys) | Simple, no dependency on auth providers |
| Hosting | Cloudflare Workers or Fly.io | Edge deployment, EU region, low latency |
| CDN | Cloudflare | Already using R2, natural fit |
| Monitoring | Grafana Cloud (free tier) | Metrics, logs, traces |
| CI/CD | GitHub Actions | Already using GitHub |

### 13.2 Cost Estimate (MVP)

| Service | Monthly Cost |
|---------|-------------|
| Cloudflare R2 (10GB) | ~$0.15 |
| Neon PostgreSQL (Pro) | $19 |
| Upstash Redis | $10 |
| Fly.io (2x shared CPU) | $10 |
| Cloudflare Workers | $5 |
| Domain + DNS | $1 |
| **Total** | **~$45/month** |

Scales to thousands of users before needing significant infrastructure investment.

---

## 14. Security Considerations

### 14.1 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Server compromise | Zero-knowledge: attacker gets ciphertext only |
| Man-in-the-middle | TLS 1.3, certificate pinning in SDKs |
| API key theft | Key rotation, IP allowlists (enterprise), short-lived delegation tokens |
| Insider threat | Zero-knowledge eliminates insider risk for content. System metadata access is logged and auditable |
| Supply chain attack on SDK | Signed releases, reproducible builds, dependency pinning |
| Brute-force key derivation | HKDF with high-entropy input, optional passphrase strengthening via Argon2id |
| Denial of service | Rate limiting, WAF, Cloudflare DDoS protection |
| Data loss | S3 durability (11 9s), PostgreSQL backups (daily + WAL streaming), cross-region replication (P2) |

### 14.2 Security Milestones

1. **Pre-launch:** Internal security review, automated SAST/DAST
2. **Launch + 3 months:** Third-party penetration test
3. **Launch + 6 months:** Bug bounty program (HackerOne)
4. **Launch + 12 months:** SOC2 Type I
5. **Launch + 18 months:** SOC2 Type II

---

## 15. Open Technical Decisions

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | API server language | TypeScript (Hono) vs Rust (Axum) | TypeScript for MVP speed. Rewrite hot paths in Rust if needed. |
| 2 | MCP transport | SSE vs Streamable HTTP | SSE for MVP (standard). Add Streamable HTTP in P1. |
| 3 | Object storage | Cloudflare R2 vs AWS S3 vs MinIO | R2 (no egress fees, simpler pricing). |
| 4 | Max object size | 10MB vs 100MB vs 1GB | 100MB for MVP. Chunked upload for larger files in P1. |
| 5 | Key storage for SDKs | OS keychain vs config file vs env var | OS keychain preferred, config file fallback, env var for CI/CD. |
| 6 | Versioning strategy | Automatic vs explicit | Automatic (every store creates a new version). Toggle per namespace. |
| 7 | Soft delete retention | 7 days vs 30 days vs plan-based | 30 days (all plans). Configurable for enterprise. |
| 8 | Metadata search | Encrypted search (SSE) vs tag-only | Tag-only for MVP. Searchable encryption is complex — evaluate in P2. |
| 9 | SDK crypto library | Web Crypto API vs libsodium vs node:crypto | Web Crypto API (browser-compatible, standard). libsodium for advanced ops (sharing). |
| 10 | Database migrations | Prisma vs Drizzle vs raw SQL | Drizzle (lightweight, type-safe, good DX). |

---

## Appendix A: Wire Format Example

### Store Request (HTTP)

```http
POST /v1/objects HTTP/1.1
Host: vault.agentvault.dev
Authorization: Bearer av_live_k1_7f3k9x2m...
Content-Type: application/json

{
  "encrypted_data": "base64(AES-256-GCM(dek, nonce, plaintext))...",
  "encrypted_metadata": "base64(AES-256-GCM(mek, meta_nonce, json({filename, tags, ...})))...",
  "wrapped_dek": "base64(AES-256-KWP(master_key, dek))...",
  "nonce": "base64(12-byte-nonce)...",
  "metadata_nonce": "base64(12-byte-nonce)...",
  "encryption_algo": "aes-256-gcm",
  "content_hash": "sha256hex...",
  "namespace": "meetings",
  "size_bytes": 4096
}
```

### Store Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "object_id": "obj_01JARQX7KPWM3N5V8HZCP4Y6T2",
  "version": 1,
  "stored_at": "2026-03-15T15:38:00.000Z",
  "size_bytes": 4096,
  "etag": "\"a1b2c3d4\""
}
```

---

## Appendix B: SDK Package Names

| Package | Registry | Name |
|---------|----------|------|
| TypeScript SDK | npm | `@bitatlas/sdk` |
| TypeScript MCP | npm | `@bitatlas/mcp` |
| Python SDK | PyPI | `bitatlas` |
| Python MCP | PyPI | `bitatlas-mcp` |
| LangChain adapter | PyPI | `langchain-bitatlas` |
| CrewAI adapter | PyPI | `crewai-bitatlas` |
| AutoGen adapter | PyPI | `autogen-bitatlas` |

---

*This is a living document. Last updated 2026-03-15.*
