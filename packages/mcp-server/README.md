# LegacyShield MCP Server 🦞

This is a Model Context Protocol (MCP) server that allows AI agents (like Claude) to interact directly with the LegacyShield Zero-Knowledge Vault.

## Features
- **list_vault_files**: Let agents see what's in the vault.
- **get_file_metadata**: Retrieve encryption headers and file info.

## Usage for Agents
Agents use this server via `stdio` to bridge the gap between their reasoning and your encrypted persistence.

## Configuration
Requires:
- \`LEGACY_SHIELD_API_URL\`
- \`LEGACY_SHIELD_API_KEY\` (generated via \`POST /agents/register\`)
