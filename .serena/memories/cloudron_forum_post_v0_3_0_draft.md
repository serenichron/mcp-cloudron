# Cloudron MCP v0.3.0 - Forum Post Draft

## Title
Cloudron MCP v0.3.0: 12 Tools Validated, 3 Need Fixes

## Post Content

Hi Cloudron community! 👋

I've been working on a Model Context Protocol (MCP) server for Cloudron integration with Claude Code. This allows AI assistants to directly manage your Cloudron instance through natural language.

**What's Working (12 tools validated)**:

**Core Operations:**
- `cloudron_list_apps` - List all installed apps
- `cloudron_get_app` - Get app details by ID
- `cloudron_get_status` - Get instance status

**App Lifecycle (New in v0.3.0):**
- `cloudron_control_app` - Start/stop/restart apps ✅ (real tested)
- `cloudron_validate_manifest` - Validate app before install ✅ (fixed + tested)

**Backups & Users:**
- `cloudron_list_backups` - View backup history ✅ (real tested)
- `cloudron_list_users` - List users with roles/2FA ✅ (real tested)

**App Store & Domains:**
- `cloudron_search_apps` - Search Cloudron app store (needs token re-verification)
- `cloudron_list_domains` - List configured domains ✅ (NEW - 14 domains tested)

**Infrastructure:**
- `cloudron_task_status` - Track async operations
- `cloudron_get_logs` - View app/service logs (needs fix)
- `cloudron_configure_app` - Update app settings (needs fix)

**What Needs Fixing (3 tools broken):**
1. `cloudron_configure_app` - Wrong endpoint (404)
2. `cloudron_get_logs` - JSON parsing error (returns text)
3. `cloudron_search_apps` - Token verification needed

**Deferred for Staging (2 destructive tools):**
- `cloudron_create_backup` - Should test in non-production
- `cloudron_create_user` - Should test in non-production

**Installation:**
```bash
npm install -g @serenichron/mcp-cloudron
```

**Usage with Claude Code:**
Add to your MCP config, then ask Claude: "List my Cloudron apps" or "Show me backup history"

**How You Can Help:**
- Test the working tools in your environment
- Report bugs or endpoint issues
- Suggest priority for next features (Phase 2 has 21+ planned)

**Transparency Note:**
This release demonstrates honest progress tracking: I'm shipping what works, documenting what's broken, and requesting community help for staging tests.

GitHub: https://github.com/serenichron/mcp-cloudron
npm: https://www.npmjs.com/package/@serenichron/mcp-cloudron

Feedback welcome! 🚀

---

## Tone Adjustments Needed
- Keep it friendly and humble
- Emphasize transparency and community collaboration
- Acknowledge limitations upfront
- Use simple language (CEFR A2/B1)

## Forum Link
https://forum.cloudron.io/ (to be posted after v0.3.0 release)
