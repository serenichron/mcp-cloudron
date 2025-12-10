# Cloudron API Research

**Status**: Complete | **Date**: 2025-12-10

## Authentication

**Methods**:
1. Bearer Token: `Authorization: Bearer <token>`
2. Query Parameter: `?access_token=<token>`

**Token Types**:
- Readonly: GET operations only
- Read/Write: Full API access

**Creation**: User profile → API tokens

## Core Endpoint Categories

### Apps Management
- Install, update, restart, stop applications
- Configure: memory limits, CPU quotas, access restrictions
- Backup, restore, clone operations
- Automatic update policies

### User & Group Administration  
- Create users, manage groups
- Set roles, handle passwords
- Configure SSO/OIDC clients

### Domain Management
- Add domains, sync DNS records
- Configure well-known settings
- Domain-specific configurations

### Backup & Recovery
- List backups, create snapshots
- Manage backup policies
- Restore from existing backups

### Mail Services
- Manage mailboxes, distribution lists
- Relay settings, spam filters
- Mailserver configurations

### System Operations
- Monitor system status, manage services
- Handle disk usage, access logs
- Execute reboots

## HTTP Conventions

**Success**: 2xx (200 with body, 204 empty)
**Client Errors**: 4xx (401 auth, 403 permissions)
**Server Errors**: 5xx

## Pagination

Parameters: `page`, `per_page` (1-based indexing)

## Format

- JSON for all request/response bodies
- REST conventions: POST (create/update), DELETE (remove), PUT (idempotent replace)

## Rate Limiting

Not documented in fetched content - requires further investigation

## Key Integration Points for MCP

**High-Value Tools**:
1. App lifecycle: install, configure, restart, backup
2. Domain management: add, verify DNS, configure
3. User management: create, set permissions
4. System monitoring: status, logs, disk usage
5. Backup operations: create, list, restore

**Authentication Flow**:
- Store API token securely (environment variable)
- Include in all requests via Bearer header
- Handle 401/403 gracefully with clear error messages

**Error Handling**:
- Parse standard HTTP status codes
- Return structured error responses to MCP clients
- Log authentication failures separately

**Next Steps**:
- Test API endpoints with real Cloudron instance
- Document rate limits empirically
- Map endpoints to MCP tool schemas