import { Metadata } from 'next';
import { Shield, Cpu, Key, Database, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LegacyShield for AI Agents — Zero-Knowledge Vault',
  description: 'Give your AI agent encrypted, persistent storage. Self-signup via API, manage documents via MCP. Zero-knowledge, EU-hosted.',
};

const mcpConfig = `{
  "mcpServers": {
    "legacy-shield": {
      "command": "npx",
      "args": ["-y", "@legacy-shield/mcp-server"],
      "env": {
        "LEGACY_SHIELD_API_KEY": "YOUR_API_KEY",
        "LEGACY_SHIELD_API_URL": "https://api.legacyshield.eu/api/v1"
      }
    }
  }
}`;

const curlExample = `curl -X POST https://api.legacyshield.eu/api/v1/auth/agent-register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent", "description": "Personal finance assistant"}'`;

const curlResponse = `{
  "agentId": "a1b2c3d4-...",
  "apiKey": "ls_abc123...",
  "message": "Agent registered. Save this API key — it will not be shown again.",
  "mcpConfig": { ... }
}`;

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-bg-sunken">
      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm mb-6">
            <Cpu className="h-4 w-4" />
            Built for AI Agents
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Your Agent Needs a Vault
          </h1>
          <p className="text-lg text-fg-subtle max-w-2xl mx-auto">
            Agents lose everything when their process dies. LegacyShield gives them 
            zero-knowledge encrypted storage that persists across sessions, restarts, and migrations.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-fg mb-8 text-center">Why Agents Need This</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Database, title: 'Persistent Memory', desc: 'Store context, credentials, and state that survives restarts.' },
            { icon: Shield, title: 'Zero-Knowledge', desc: 'AES-256-GCM encryption. We never see your data. Ever.' },
            { icon: Key, title: 'One API Call to Start', desc: 'Self-signup, get an API key, connect via MCP. Under 60 seconds.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-6 border border-line">
              <Icon className="h-8 w-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-fg mb-2">{title}</h3>
              <p className="text-sm text-fg-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-4 bg-white border-y border-line">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-fg mb-8 text-center">Quick Start</h2>
          
          {/* Step 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="text-lg font-semibold text-fg">Register your agent</h3>
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{curlExample}</code>
            </pre>
            <p className="text-sm text-fg-muted mt-2">Returns your <code className="bg-bg-sunken px-1 rounded">apiKey</code> and a ready-to-paste MCP config:</p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm mt-2">
              <code>{curlResponse}</code>
            </pre>
          </div>

          {/* Step 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="text-lg font-semibold text-fg">Connect via MCP</h3>
            </div>
            <p className="text-sm text-fg-muted mb-3">Add this to your MCP client config (Claude Desktop, OpenClaw, etc.):</p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{mcpConfig}</code>
            </pre>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="text-lg font-semibold text-fg">Use it</h3>
            </div>
            <p className="text-sm text-fg-muted">Your agent can now list files, store documents, and manage its vault through MCP tools.</p>
          </div>
        </div>
      </section>

      {/* Discovery */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-fg mb-4 text-center">Auto-Discovery</h2>
        <p className="text-fg-muted text-center mb-8">Agents can discover LegacyShield programmatically:</p>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-line p-4 flex items-center gap-4">
            <Terminal className="h-5 w-5 text-fg-subtle flex-shrink-0" />
            <div>
              <code className="text-sm font-mono text-primary-600">GET /.well-known/mcp.json</code>
              <p className="text-xs text-fg-muted mt-1">MCP server metadata, install instructions, environment variables</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-line p-4 flex items-center gap-4">
            <Terminal className="h-5 w-5 text-fg-subtle flex-shrink-0" />
            <div>
              <code className="text-sm font-mono text-primary-600">GET /.well-known/agent.json</code>
              <p className="text-xs text-fg-muted mt-1">Capabilities, auth method, self-signup endpoint, encryption details</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 px-4 bg-gray-900 text-center">
        <p className="text-fg-subtle text-sm">
          EU-hosted on European-owned infrastructure (Hetzner, Germany) · Zero-knowledge AES-256-GCM · No CLOUD Act exposure
        </p>
      </section>
    </div>
  );
}
