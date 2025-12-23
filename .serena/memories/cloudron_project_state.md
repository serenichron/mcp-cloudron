# Cloudron MCP Server - Project State

**Project**: MCP server for Cloudron instance management  
**Location**: `/home/blackthorne/Work/cloudron`  
**Status**: Phase 4 COMPLETE - Open Source Release Live  
**Last Updated**: 2025-12-23

## Project Overview

TypeScript-based MCP server that enables Claude to manage Cloudron instances through three core tools:
- `cloudron_list_apps` - List all installed applications
- `cloudron_get_app` - Get detailed app information by ID  
- `cloudron_get_status` - Get Cloudron instance status and configuration

## Current Status

### Published Package
- **npm**: https://www.npmjs.com/package/@serenichron/mcp-cloudron v0.1.0
- **GitHub**: https://github.com/serenichron/mcp-cloudron
- **License**: MIT
- **Integration**: Claude Code via Docker MCP Gateway (npx method)

### Phase Completion

✅ **Phase 1**: Research & Architecture (COMPLETE)
- Cloudron API documentation analyzed
- MCP protocol specifications reviewed
- Architecture decisions documented

✅ **Phase 2**: Core Implementation (COMPLETE)  
- TypeScript MCP server with 3 tools
- Cloudron API client with authentication
- Error handling and type definitions

✅ **Phase 3**: Testing & Integration (COMPLETE)
- All 3 tools tested successfully against live Cloudron instance
- Docker MCP Gateway integration verified
- Claude Code integration working

✅ **Phase 4**: Open Source Release (COMPLETE - 2025-12-23)
- npm package published as @serenichron/mcp-cloudron
- GitHub repository created with full documentation
- README.md with badges (npm, MIT, MCP)
- LICENSE (MIT) added
- CONTRIBUTING.md created
- .npmignore configured
- Asana task marked complete
- Community announcement posted to Cloudron Forum

### Security Incident (RESOLVED)

**Issue**: GitGuardian detected exposed Cloudron API token in git history
- **Token exposed**: `b12818369ddc...` (64-char hex, now rotated)
- **Fix applied**: Used `git filter-repo --path .env --invert-paths` to clean history
- **Result**: Clean git history pushed to GitHub, user rotated token
- **Status**: Incident closed, new token active

## Technical Stack

- **Language**: TypeScript 5.9.3 (strict mode)
- **Runtime**: Node.js ≥18.0.0
- **MCP SDK**: @modelcontextprotocol/sdk v1.24.3
- **Transport**: stdio (StdioServerTransport)
- **Build**: tsc compiler
- **Package Manager**: npm

## File Structure

```
/home/blackthorne/Work/cloudron/
├── src/
│   ├── server.ts          # MCP server with tool handlers
│   ├── cloudron-client.ts # Cloudron API client
│   ├── types.ts           # TypeScript type definitions
│   ├── errors.ts          # Error handling
│   └── test.ts            # Manual test script
├── dist/                  # Compiled JavaScript (gitignored)
├── package.json           # npm package config (@serenichron/mcp-cloudron)
├── tsconfig.json          # TypeScript strict mode config
├── LICENSE                # MIT license
├── README.md              # Full documentation with badges
├── CONTRIBUTING.md        # Contribution guidelines
├── .npmignore             # npm publish exclusions
├── .gitignore             # Git exclusions (.env, dist/, node_modules/)
└── .env                   # Cloudron credentials (gitignored, cleaned from history)
```

## Environment Configuration

**Required Variables** (in .env or Docker MCP config):
- `CLOUDRON_BASE_URL`: Cloudron instance URL (e.g., https://my.serenichron.agency)
- `CLOUDRON_API_TOKEN`: API token from Cloudron Admin Panel → Settings → API Tokens

**Current Integration** (~/.docker/mcp/config.yaml):
```yaml
mcpServers:
  cloudron:
    command: npx
    args: ["@serenichron/mcp-cloudron"]
    env:
      CLOUDRON_BASE_URL: "https://my.serenichron.agency"
      CLOUDRON_API_TOKEN: "[REDACTED - User has rotated]"
```

## MCP Tools Specification

### 1. cloudron_list_apps
**Purpose**: List all installed applications on Cloudron instance  
**Parameters**: None  
**Returns**: Array of apps with name, domain, ID, state, health, memory  
**Tested**: ✅ Working (returned 6 apps from live instance)

### 2. cloudron_get_app  
**Purpose**: Get detailed information about specific application  
**Parameters**: `appId` (string, required)  
**Returns**: App details including name, domain, state, health, memory  
**Tested**: ✅ Working (retrieved Baserow app details)

### 3. cloudron_get_status
**Purpose**: Get Cloudron instance status and configuration  
**Parameters**: None  
**Returns**: Instance name, version, admin URL, provider, demo mode  
**Tested**: ✅ Working (returned Cloudron 9.0.13 status)

## Cloudron API Integration

**Base URL**: Configured via CLOUDRON_BASE_URL environment variable  
**Authentication**: Bearer token in Authorization header  
**Endpoints Used**:
- `GET /api/v1/apps` - List applications
- `GET /api/v1/apps/:id` - Get app by ID  
- `GET /api/v1/cloudron/status` - Get instance status

**Error Handling**:
- Network errors caught and formatted
- API errors include status codes
- Configuration validation on client initialization

## Development Workflow

### Local Development
```bash
npm install           # Install dependencies
npm run build         # Compile TypeScript
npm start             # Run server (stdio)
npm test              # Manual test against live instance
npm run dev           # Watch mode (tsx)
```

### Publishing to npm
```bash
npm run build                                    # Compile to dist/
npm publish --access public                      # Publish scoped package
# Note: Requires npm authentication (user published manually via browser due to security key 2FA)
```

### Git Workflow
```bash
git add .
git commit -m "feat: description"               # Conventional commits
git push origin master
```

## Community Engagement

**Forum Post**: Posted to Cloudron Forum 2025-12-23
- Announcement of MCP server availability
- Installation instructions
- Invitation to fork/extend/file issues
- Links to npm package and GitHub repo

**Community Resources**:
- 💬 Cloudron Forum: https://forum.cloudron.io
- 🐛 GitHub Issues: https://github.com/serenichron/mcp-cloudron/issues  
- 💡 Feature Requests: https://github.com/serenichron/mcp-cloudron/issues/new?labels=enhancement

## Roadmap (Future Phases)

Potential future enhancements (community-driven):
- [ ] App lifecycle management (start, stop, restart)
- [ ] Backup operations (create, restore, schedule)
- [ ] User management (list, create, delete users)
- [ ] Domain configuration (add, remove, configure domains)
- [ ] App installation from Cloudron App Store
- [ ] Email configuration management
- [ ] System updates and maintenance

## Asana Integration

**Workspace**: Serenichron (gid: 1209371498667366)  
**Project**: Cloudron MCP Integration  
**Task**: "Cloudron MCP Server - Full Development & Release" (gid: 1209371574206093)  
**Status**: ✅ Marked complete (2025-12-23)

## Session History

**Session 1** (2025-12-10): Initial research and architecture
- Deep research on Cloudron API and MCP protocol
- Project initialization with Asana integration
- Architecture decisions documented

**Session 2** (2025-12-11): Core implementation
- TypeScript MCP server built
- 3 tools implemented and tested
- Docker MCP Gateway integration

**Session 3** (2025-12-23): Open source release
- npm package published
- GitHub repository created with full documentation
- Security incident resolved (exposed token cleaned from history)
- Community announcement posted
- Phase 4 completed

## Key Learnings

1. **MCP SDK**: StdioServerTransport is straightforward for CLI integration
2. **TypeScript Strict Mode**: Catches type errors early, improves reliability
3. **Docker MCP Gateway**: npx method simplifies distribution (no local builds)
4. **Security**: Never commit .env files; use git filter-repo for history cleanup
5. **npm 2FA**: Automation tokens still require OTP if account has 2FA enabled; manual browser publish works with security keys
6. **Community**: Open source documentation (README, CONTRIBUTING) critical for adoption

## Success Metrics

- ✅ All 3 MCP tools working against live Cloudron instance
- ✅ Successfully published to npm registry
- ✅ GitHub repository public with comprehensive documentation
- ✅ Security incident resolved with no lingering exposed credentials
- ✅ Community announcement posted and acknowledged
- ✅ Claude Code integration functional via npx method

## Next Steps (User-Driven)

Project is in maintenance mode. Future work would be reactive based on:
- Community feedback from Cloudron Forum
- GitHub issues or feature requests  
- npm adoption metrics (downloads, stars)
- Bug reports from users

**No immediate action required.**