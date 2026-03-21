# LegacyShield: Zero-Knowledge Encrypted Vault for AI Agents

## Description
A zero-knowledge encrypted vault that allows AI agents to securely store and retrieve sensitive user documents (wills, passports, digital legacy) without ever seeing the plaintext. 

Built for the "Agent-to-Agent" economy, LegacyShield provides a secure persistence layer that persists across sessions and platforms.

## Key Features
- **Zero-Knowledge Architecture**: Encryption happens client-side (agent-side). The vault never sees your keys or plaintext.
- **Cross-Platform Persistence**: Your agent's long-term memory and sensitive artifacts persist across Claude Code, OpenClaw, and Codex sessions.
- **Emergency Access Protocol**: Built-in "Dead Man's Switch" logic to ensure digital assets are handed over to designated heirs if the human becomes inactive.
- **MCP Native**: First-class support for Model Context Protocol.

## Installation

### OpenClaw
```bash
openclaw skill install legacyshield
```

### Manual
Add to your `skills/` directory:
```bash
git clone https://github.com/bitatlas-group/legacyshield-skill.git ~/.openclaw/skills/legacyshield
```

## Usage

### Store a document
"Lobbi, store my current draft of my will in my LegacyShield vault."

### Retrieve a document
"Lobbi, fetch my passport scan from my LegacyShield vault for this visa application."

## Config
```json
{
  "legacyshield": {
    "apiKey": "YOUR_LEGACYSHIELD_API_KEY",
    "vaultId": "YOUR_VAULT_ID"
  }
}
```

## Platform
- Website: https://legacyshield.eu
- Documentation: https://docs.legacyshield.eu
- Support: support@legacyshield.eu
