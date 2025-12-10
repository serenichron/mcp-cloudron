# Cloudron MCP Server Architecture

**Status**: Design Phase | **Date**: 2025-12-10

## Architecture Overview

**Pattern**: TypeScript MCP Server with stdio transport
**Integration**: SuperClaude framework via Docker MCP Gateway
**Deployment**: Open source community distribution

## Technology Stack

**Language**: TypeScript 5.x
**Runtime**: Node.js 20+
**MCP SDK**: @modelcontextprotocol/sdk
**Transport**: stdio (local process communication)
**Build**: tsx for development, tsc for production

## Project Structure

```
cloudron/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── cloudron-client.ts    # Cloudron API wrapper
│   ├── tools/                # MCP tool definitions
│   │   ├── apps.ts           # App management tools
│   │   ├── domains.ts        # Domain management tools
│   │   ├── users.ts          # User management tools
│   │   ├── system.ts         # System monitoring tools
│   │   └── backups.ts        # Backup operations tools
│   ├── types.ts              # TypeScript type definitions
│   └── errors.ts             # Error handling utilities
├── dist/                     # Compiled JavaScript
├── tests/                    # Test suite
├── docs/                     # Documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Core Components

### 1. MCP Server (index.ts)

**Responsibilities**:
- Initialize MCP server with stdio transport
- Register all tool handlers
- Handle capability negotiation
- Manage server lifecycle

**Initialization**:
```typescript
const server = new Server({
  name: "cloudron-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [/* tool definitions */]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Route to appropriate tool handler
});

await server.connect(new StdioServerTransport());
```

### 2. Cloudron Client (cloudron-client.ts)

**Responsibilities**:
- Wrap Cloudron REST API
- Handle authentication (Bearer token)
- Implement retry logic with exponential backoff
- Parse and normalize responses
- Comprehensive error handling

**Key Methods**:
```typescript
class CloudronClient {
  constructor(baseUrl: string, token: string);
  
  // Apps
  async listApps(): Promise<App[]>;
  async installApp(manifest: string, config: AppConfig): Promise<App>;
  async restartApp(appId: string): Promise<void>;
  async configureApp(appId: string, config: Partial<AppConfig>): Promise<App>;
  async backupApp(appId: string): Promise<Backup>;
  
  // Domains
  async listDomains(): Promise<Domain[]>;
  async addDomain(domain: string): Promise<Domain>;
  async syncDNS(domainId: string): Promise<DNSStatus>;
  
  // Users
  async listUsers(): Promise<User[]>;
  async createUser(username: string, email: string): Promise<User>;
  async setUserRole(userId: string, role: string): Promise<User>;
  
  // System
  async getStatus(): Promise<SystemStatus>;
  async getLogs(service: string, lines: number): Promise<string[]>;
  
  // Backups
  async listBackups(): Promise<Backup[]>;
  async createBackup(): Promise<Backup>;
  async restoreBackup(backupId: string): Promise<void>;
}
```

### 3. MCP Tools

**Tool Categories** (5 TypeScript modules):

#### Apps Tools (tools/apps.ts)
- `cloudron_list_apps`: List all installed applications
- `cloudron_install_app`: Install new application from manifest
- `cloudron_restart_app`: Restart specific application
- `cloudron_configure_app`: Update app configuration (memory, CPU, access)
- `cloudron_backup_app`: Create app-specific backup
- `cloudron_app_logs`: Retrieve application logs

#### Domain Tools (tools/domains.ts)
- `cloudron_list_domains`: List configured domains
- `cloudron_add_domain`: Add new domain to Cloudron
- `cloudron_sync_dns`: Sync DNS records for domain
- `cloudron_configure_domain`: Update domain settings

#### User Tools (tools/users.ts)
- `cloudron_list_users`: List all users
- `cloudron_create_user`: Create new user account
- `cloudron_set_user_role`: Assign role to user
- `cloudron_list_groups`: List user groups
- `cloudron_create_group`: Create user group

#### System Tools (tools/system.ts)
- `cloudron_status`: Get system status and health
- `cloudron_disk_usage`: Check disk usage statistics
- `cloudron_service_logs`: Retrieve service logs
- `cloudron_list_services`: List all system services

#### Backup Tools (tools/backups.ts)
- `cloudron_list_backups`: List available backups
- `cloudron_create_backup`: Create system backup
- `cloudron_restore_backup`: Restore from backup
- `cloudron_backup_status`: Check backup operation status

**Tool Schema Pattern**:
```typescript
{
  name: "cloudron_install_app",
  description: "Install a new application on Cloudron",
  inputSchema: {
    type: "object",
    properties: {
      manifest: {
        type: "string",
        description: "Application manifest identifier"
      },
      location: {
        type: "string",
        description: "Subdomain for the application"
      },
      portBindings: {
        type: "object",
        description: "Port configuration (optional)"
      }
    },
    required: ["manifest", "location"]
  }
}
```

### 4. Error Handling (errors.ts)

**Error Categories**:
- `CloudronAuthError`: Authentication failures (401)
- `CloudronPermissionError`: Permission denied (403)
- `CloudronNotFoundError`: Resource not found (404)
- `CloudronAPIError`: General API errors
- `CloudronRateLimitError`: Rate limit exceeded

**MCP Error Mapping**:
```typescript
function toMCPError(cloudronError: Error): MCPError {
  if (cloudronError instanceof CloudronAuthError) {
    return new MCPError(
      ErrorCode.InvalidRequest,
      "Authentication failed. Check CLOUDRON_API_TOKEN."
    );
  }
  // ... other mappings
}
```

## Authentication & Configuration

**Environment Variables**:
- `CLOUDRON_BASE_URL`: Cloudron instance URL (required)
- `CLOUDRON_API_TOKEN`: API token with read/write permissions (required)
- `CLOUDRON_TIMEOUT`: Request timeout in ms (default: 30000)
- `CLOUDRON_RETRY_ATTEMPTS`: Max retry attempts (default: 3)

**Validation**:
- Server validates environment variables at startup
- Fails fast with clear error if missing/invalid
- Tests token with lightweight API call before starting

## Security Considerations

**Token Management**:
- Never log token or include in error messages
- Load from environment variable only
- Recommend using read-only token where possible

**Input Validation**:
- Validate all tool parameters against JSON Schema
- Sanitize inputs before API calls
- Reject suspicious patterns (path traversal, injection)

**Rate Limiting**:
- Implement client-side rate limiting wrapper
- Exponential backoff on errors
- Respect Cloudron API limits (to be determined empirically)

## Testing Strategy

**Unit Tests**:
- Mock Cloudron API responses
- Test error handling paths
- Validate input schemas

**Integration Tests**:
- Real Cloudron instance (dev environment)
- Test top 10 most common operations
- Verify error messages are actionable

**MCP Protocol Tests**:
- Test stdio transport communication
- Verify tool schema compliance
- Test capability negotiation

## Deployment

**SuperClaude Integration** (Docker MCP Gateway):
```yaml
# ~/.docker/mcp/config.yaml
mcpServers:
  cloudron:
    env:
      CLOUDRON_BASE_URL: "https://my.cloudron.domain"
      CLOUDRON_API_TOKEN: "secret-token"
```

**Open Source Distribution**:
- GitHub repository: `blackthorne/mcp-server-cloudron`
- npm package: `@blackthorne/mcp-cloudron`
- Documentation: README.md, API.md, CONTRIBUTING.md
- License: MIT

## Agent Framework Integration

**SuperClaude Agent**: `~/.claude/agents/mcp-specialists/cloudron.md`

**Agent Capabilities**:
- Cloudron instance management
- App lifecycle orchestration
- Domain configuration workflows
- Backup and disaster recovery
- User and permission management

**Skills**:
- `cloudron-app-deployment`: Install and configure apps
- `cloudron-domain-setup`: Add domains and verify DNS
- `cloudron-backup-restore`: Backup strategies and recovery

**Hooks**:
- `PreToolUse`: Validate Cloudron connectivity
- `PostToolUse`: Log operations to Serena memory
- `OnError`: Structured error logging with context

## Serena Memory Integration

**Living References**:
- `cloudron_infrastructure_knowledge`: Instance details, common operations
- `cloudron_app_catalog`: Installed apps, configurations
- `cloudron_domain_registry`: Managed domains, DNS status

**Session Context**:
- Log all Cloudron operations with timestamp
- Track configuration changes
- Document troubleshooting steps

## Content Pipeline (serenichron)

**Documentation Generation**:
- Tutorial: "Setting up Cloudron MCP with SuperClaude"
- Guide: "Top 10 Cloudron automation workflows"
- Reference: "Complete Cloudron MCP tool catalog"

**Blog Posts**:
- "Automating Cloudron with AI: An MCP Integration"
- "Building Production-Ready MCP Servers: Lessons from Cloudron"

**Video Content**:
- Demo: Installing and configuring apps via AI
- Tutorial: Domain setup automation workflow

## Next Steps

**Phase 2: Implementation**:
1. Implement CloudronClient with top 5 endpoints
2. Create MCP server scaffold with stdio transport
3. Implement 3 core tools (list_apps, install_app, status)
4. Add comprehensive error handling
5. Write unit tests for client and tools

**Phase 3: SuperClaude Integration**:
1. Create cloudron specialist agent definition
2. Add to Docker MCP Gateway config
3. Test end-to-end: spawn agent → use tool → verify result
4. Document integration in framework

**Phase 4: Open Source Release**:
1. Complete documentation (README, API reference)
2. Add integration tests
3. Create GitHub repository
4. Publish to npm
5. Write announcement blog post

**Success Metrics**:
- All 20 tools implemented and tested
- <100ms MCP tool invocation overhead
- 100% test coverage for error paths
- Zero token/credential leaks in logs
- Community adoption (GitHub stars, npm downloads)