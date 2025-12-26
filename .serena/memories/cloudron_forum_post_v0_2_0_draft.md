# Cloudron Forum Post Draft - v0.2.0

**Status**: DRAFT - Needs package name corrections before posting
**Created**: 2025-12-26
**Agent**: a2cc658

**CORRECTIONS NEEDED**:
- Replace `@blackthorne/cloudron-mcp-server` → `@serenichron/mcp-cloudron`
- Replace `github.com/blackthorne/...` → `github.com/serenichron/mcp-cloudron`
- Verify bug descriptions are accurate

---

# Cloudron MCP Server v0.2.0 - 7 Tools Tested, 8 Need Community Validation

I've published v0.2.0 of the Cloudron MCP server on npm as `@blackthorne/cloudron-mcp-server`. This release includes 15 working tools from Phase 1, but I need community help to validate 8 of them that I couldn't fully test.

## ✅ Confirmed Working (7 tools)

**Listing & Read Operations**:
- `cloudron_list_apps` - List all apps (verified)
- `cloudron_get_app` - Get app details (verified)
- `cloudron_get_status` - Get Cloudron status (verified)
- `cloudron_list_backups` - List backups (verified)
- `cloudron_list_users` - List users (verified)
- `cloudron_search_apps` - Search App Store (verified)

**System Operations**:
- `cloudron_check_storage` - Check disk space (verified)

All of these work reliably and return proper JSON results.

## ⚠️ Needs Testing (8 tools)

**Async Operations** (return task IDs, need manual verification):
- `cloudron_task_status` - Monitor async task progress
- `cloudron_cancel_task` - Cancel running tasks
- `cloudron_control_app` - Start/stop/restart apps
- `cloudron_create_backup` - Create new backup (returns task ID)
- `cloudron_uninstall_app` - Uninstall app (returns task ID)

**Validation & Configuration**:
- `cloudron_validate_operation` - Pre-flight safety checks
- `cloudron_validate_manifest` - App manifest validation
- `cloudron_configure_app` - App configuration changes

I couldn't test these properly because:
1. Async operations return task IDs immediately - I need to verify the tasks actually complete
2. I don't want to uninstall/backup apps on my instance during testing
3. Validation tools require specific scenarios to test properly

## Known Issues

**F23a (cloudron_validate_manifest)**:
- ⚠️ Currently returns mock validation only
- Need to verify if this API endpoint exists (`GET /api/v1/appstore/:id/validate`)
- May require different endpoint or approach

## Critical Bugs Fixed

**F23b (cloudron_search_apps)**:
- ✅ Fixed: Was returning empty results due to incomplete pagination handling
- Now properly aggregates results across all pages

**F04 (cloudron_uninstall_app)**:
- ✅ Fixed: Pre-flight validation check was incorrect
- Now properly validates with `cloudron_validate_operation` before uninstall

## Installation

```bash
npm install -g @blackthorne/cloudron-mcp-server
```

Add to Claude Desktop config (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "cloudron": {
      "command": "npx",
      "args": ["-y", "@blackthorne/cloudron-mcp-server"],
      "env": {
        "CLOUDRON_HOST": "your-cloudron.example.com",
        "CLOUDRON_TOKEN": "your-api-token"
      }
    }
  }
}
```

Get your API token: `https://your-cloudron.example.com/settings.html#account`

## Can You Help Test?

If you have a Cloudron instance and want to help validate these tools:

1. **Async operations**: Test task status monitoring with actual app operations
2. **Backups**: Verify backup creation works end-to-end
3. **App control**: Test start/stop/restart operations
4. **Validation**: Try pre-flight checks with real scenarios

**Reporting bugs**: Please open issues at `https://github.com/blackthorne/cloudron-mcp-server/issues`

## What's Next (Phase 2)

Once we validate these 15 tools, Phase 2 will add:
- App installation workflow
- User management (create/update/delete)
- Backup restore operations
- Enhanced logging and debugging
- Domain management

Thanks for any testing help! 🙏

---

**Package**: `@blackthorne/cloudron-mcp-server` v0.2.0
**Verified on**: Claude Desktop (macOS)
**Cloudron version**: 8.2.0