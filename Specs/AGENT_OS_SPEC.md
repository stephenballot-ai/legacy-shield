# SPEC: LegacyShield Agent-Native Layer (AgentOS)

**Status:** Draft / Conceptual
**Objective:** Transition LegacyShield from a human-only web vault to a background "Persistence Layer" for autonomous agents.

## 1. The Core Concept: "Agent Persistence"
Humans have memory and hard drives. Agents have context windows and transient storage. When an agent's process is killed, it loses its "state." LegacyShield provides a **Zero-Knowledge Long-Term Memory** (ZKLTM) for agents.

## 2. Key Features

### A. Agent-Native Onboarding (`/auth/agent-register`)
*   **No Email Loops:** Allow account creation via signed cryptographic payloads (e.g., using a wallet or a developer's Master Key).
*   **Immediate API Keys:** Return a scoped API key + encryption salt in the JSON response.

### B. The Handshake Protocol (KYA - Know Your Agent)
*   **Delegated Encryption:** Humans can delegate a "Sub-Secret" to an agent. This secret is derived from the user's master password but is scoped only to a specific "Agent Folder."
*   **Proof of Continuity:** LegacyShield issues a JWT to the agent that it can show to other agents as "Proof" that its state is backed up and recoverable.

### C. Agent-Native Endpoints
*   `POST /agent/v1/vault/blob`: Encrypted stream directly to MinIO.
*   `GET /agent/v1/vault/heartbeat`: A "Dead Man's Switch" for the agent. If the agent doesn't ping for 24h, LegacyShield can trigger a webhook to a "Recovery Agent" or the human owner.
*   `POST /agent/v1/vault/handoff`: Securely transfer access from Agent A to Agent B without the human needing to re-upload.

## 3. Technical Implementation (The "SDK-First" Approach)
We don't build a dashboard for agents. We build a **CLI and a Library**.
*   `pip install legacyshield-agent`
*   `legacyshield init --agent-id "tax-bot-3000"`
*   `legacyshield push ./encrypted-context.json`

## 4. Distribution Strategy: Where Agents "Live"

To get agents to use us, we need to be where they are discovered and "hired."

### 🟢 ClawHub (The Low-Hanging Fruit)
*   **What it is:** The skill registry for OpenClaw (and increasingly others).
*   **The Play:** Publish a `legacyshield` skill to ClawHub. This allows any OpenClaw user to say *"Lobbi, use the legacyshield skill to back up your own memory files every night."* We become our own first customer.

### 🟣 MCP (Model Context Protocol)
*   **What it is:** Anthropic’s new open standard for connecting AI models to data sources.
*   **The Play:** Build an **MCP Server for LegacyShield**. This allows Claude (and other models) to "see" LegacyShield as a tool in their sidebar. "Store this in my vault" becomes a native command.

### 🟡 Agent Protocol (X42 / AI Agent Protocol)
*   **What it is:** Emerging standards for agent-to-agent communication.
*   **The Play:** Implement the standard `storage` interface defined by these protocols so any compliant agent can "plug in" LegacyShield as its database.

### 🔵 Developer Marketplaces (LangChain / LlamaIndex)
*   **What it is:** Where developers build the "guts" of these agents.
*   **The Play:** Build a **LangChain Data Loader** and a **LlamaIndex Vector Store wrapper**. This targets the *builders* before the agents are even born.

## 5. Next Steps
1.  **Draft the MCP Server:** This is the highest "vibe" distribution channel right now.
2.  **Add `apiKey` support to the API:** Our current API is session/cookie-based. We need a `X-API-KEY` header path for agents.
3.  **Prototype "Agent Heartbeat":** Build the endpoint that monitors agent health.
