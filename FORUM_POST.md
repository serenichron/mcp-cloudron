# Cloudron Forum Announcement Post

**Forum URL**: https://forum.cloudron.io
**Recommended Category**: **Discuss** (Feedback, suggestions, anything else Cloudron related)
**Alternative Categories**: Feature Requests or App Packaging & Development

**Post Title**: MCP Server for Cloudron - AI-Powered Instance Management

---

## Post Content

Hello Cloudron Community! 👋

I'm excited to share **mcp-cloudron** - an open-source MCP (Model Context Protocol) server that lets AI assistants interact with your Cloudron instance.

### What is MCP?

MCP is Anthropic's open standard for connecting AI assistants (like Claude) to external tools and data sources. This server gives AI agents the ability to query and manage your Cloudron instance programmatically.

### Current Features (v1.0.0)

- **List Applications** - See all installed apps with status, health, domain, and resource usage
- **Get App Details** - Detailed information on specific applications by ID
- **Instance Status** - Query Cloudron version, configuration, and system info

### Quick Start

Install via npm:
```bash
npm install @serenichron/mcp-cloudron
```

**Configuration**: You'll need a Cloudron API token (Settings → API Tokens). Then add to your MCP client configuration:

```json
{
  "mcpServers": {
    "cloudron": {
      "command": "npx",
      "args": ["-y", "@serenichron/mcp-cloudron"],
      "env": {
        "CLOUDRON_DOMAIN": "your-cloudron.example.com",
        "CLOUDRON_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Use Cases

With this MCP server, AI assistants can:
- Monitor app health and status across your instance
- Get detailed resource usage and configuration info
- Help troubleshoot issues by querying app states
- Provide intelligent suggestions based on your Cloudron setup

### Links

- 📦 **npm Package**: https://www.npmjs.com/package/@serenichron/mcp-cloudron
- 🐙 **GitHub Repository**: https://github.com/serenichron/mcp-cloudron
- 📖 **Documentation**: Full setup guide and API reference in README

### Roadmap

Future features planned for upcoming releases:
- App lifecycle management (start/stop/restart/uninstall)
- App installation from the App Store
- Backup and restore operations
- Log access and monitoring
- Event subscriptions and webhooks

### Security Note

The server uses read-only operations in v1.0.0 (list apps, get status). Future write operations will include appropriate safety checks and confirmations. Always use dedicated API tokens with minimal required permissions.

### Contributions Welcome!

This project is MIT licensed and I'd love community input:
- **Feature Requests**: What Cloudron operations would be most useful for AI automation?
- **Bug Reports**: Issues and feedback on GitHub
- **Pull Requests**: Code contributions welcome!
- **Integration Ideas**: How are you using it? Share your use cases!

### Testing & Compatibility

- Tested with Cloudron 8.2.0+
- Works with Claude Desktop, Continue.dev, and other MCP-compatible clients
- Node.js 18+ required

Looking forward to your feedback and suggestions!

---

## Posting Instructions

1. Visit https://forum.cloudron.io
2. Log in to your Cloudron Forum account
3. Navigate to the **Discuss** category: https://forum.cloudron.io/category/2/discuss
4. Click "New Topic"
5. Copy the post title: **MCP Server for Cloudron - AI-Powered Instance Management**
6. Copy the post content (everything from "Hello Cloudron Community!" onwards)
7. Add tags if available: `integration`, `mcp`, `ai`, `automation`
8. Preview and post!

### Alternative Categories (if Discuss doesn't seem right)

- **App Packaging & Development**: If you want to emphasize the development/integration aspect
- **Feature Requests**: If framing it as a community tool suggestion

### Post-Posting Actions

- Monitor the thread for questions and feedback
- Respond to community suggestions for roadmap priorities
- Update the thread when new versions are released
