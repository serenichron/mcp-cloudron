# MCP Protocol Research

**Status**: Complete | **Date**: 2025-12-10

## Core Definition

MCP = "USB-C port for AI applications"
- Open-source standard connecting AI apps to external systems
- Standardized connectivity for data sources, services, workflows

## Server Architecture

**Three Feature Categories**:

1. **Resources**: Static/dynamic data sources clients can read
   - File contents, database records, API responses
   - Support both static and streaming patterns

2. **Tools**: Functions servers implement for client invocation
   - Defined input schemas (JSON Schema)
   - Execution logic with error handling
   - Return structured results

3. **Prompts**: Pre-built instruction templates
   - Guide AI model behavior for specific tasks
   - Parameterizable with context injection

**Request-Response Model**:
- Clients initiate communication
- Servers respond with results or errors
- Synchronous execution pattern

## Transport Mechanisms

**Stdio**: Local process communication
- Standard input/output streams
- Suitable for CLI tools, local agents

**SSE (Server-Sent Events)**: Remote HTTP streaming
- HTTP-based for network connections
- Real-time updates support

**Transport Abstraction**: Same server logic across different transports

## Tool Definition Structure

```typescript
{
  name: string,
  description: string,
  inputSchema: JSONSchema,
  handler: async (params) => result
}
```

## Initialization Sequence

1. **Capability Negotiation**:
   - Server declares supported features
   - Client indicates requirements
   - Establish shared understanding

2. **Operational Communication**:
   - Client requests tools/resources
   - Server executes and returns results

## Security Considerations

- Authorization frameworks for sensitive resources
- Proper credential handling (never log/expose)
- Validate all client requests
- Principle of least privilege for resource access

## Best Practices

**Tool Design**:
- Clear, specific schemas
- Descriptive names and documentation
- Proper error handling and logging

**Server Implementation**:
- Version your implementation
- Document resource formats explicitly
- Consider scalability in resource delivery
- Handle concurrent requests gracefully

**Error Handling**:
- Structured error responses
- Clear error messages for clients
- Log errors with context for debugging

## Integration with Cloudron

**Architecture Decision**:
- Use **stdio transport** for simplicity (local SuperClaude integration)
- Implement **tools category** (Cloudron API operations)
- Defer resources/prompts until needed

**Tool Mapping Strategy**:
1. App Management tools: install, restart, backup, configure
2. Domain tools: add, verify, sync DNS
3. User tools: create, permissions, groups
4. System tools: status, logs, monitoring

**Error Strategy**:
- Wrap Cloudron API errors in MCP error format
- Add context (endpoint called, parameters)
- Return actionable error messages

**Security**:
- API token via environment variable
- Validate token before server starts
- Never log token or sensitive data
- Implement rate limiting wrapper if needed

**Next Steps**:
- Design tool schemas for top 10 Cloudron operations
- Implement MCP server with stdio transport
- Create comprehensive error handling
- Test with SuperClaude framework integration