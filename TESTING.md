# Cloudron MCP Server - Integration Testing Guide

## Phase 2.3: Real Instance Testing

This guide walks through testing the Cloudron MCP Server against a real Cloudron instance.

## Project Status

**Phase**: 2.2 Complete - MCP Server Implementation
**Build**: ✅ Successful (all TypeScript compiled)
**Tests Created**: ✅ Integration test suite ready

### Implemented Tools
1. **cloudron_list_apps** - List all installed applications
2. **cloudron_status** - Get system status and health metrics
3. **cloudron_restart_app** - Restart a specific application

## Prerequisites

### What You Need
- A running Cloudron instance (self-hosted or managed)
- API token with read/write permissions
- Bash or compatible shell environment
- Node.js 18+ (already installed for development)

### Get Your Credentials

#### Step 1: Get Your Cloudron Instance URL
Typical formats:
- `https://my.serenichron.com` (custom domain)
- `https://my.cloudron.io` (Cloudron's hosted platform)
- `https://cloudron.yourdomain.com` (your own domain)

#### Step 2: Create API Token
1. Log into your Cloudron Admin Panel
2. Navigate to **Admin → API Tokens**
3. Click **"Create API Token"**
4. Give it a meaningful name (e.g., "MCP Testing")
5. Ensure it has read and write permissions
6. Copy the generated token (secure this! It's like a password)

**Important**: Treat your API token like a password. Never commit it to version control.

## Configuration

### Option A: Environment Variables (Recommended for Testing)

```bash
export CLOUDRON_BASE_URL="https://your-cloudron-instance.com"
export CLOUDRON_API_TOKEN="your-api-token-here"
```

### Option B: .env File (Local Development)

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```
   CLOUDRON_BASE_URL=https://my.serenichron.com
   CLOUDRON_API_TOKEN=your-api-token-here
   ```

3. Note: `.env` is already in `.gitignore` - safe to use for secrets

## Running Tests

### Build the Project

```bash
npm run build
```

Expected output:
```
> @blackthorne/mcp-cloudron@0.1.0 build
> tsc
```

No errors should appear.

### Run Integration Tests

```bash
# Using environment variables
CLOUDRON_BASE_URL="https://your-instance.com" \
CLOUDRON_API_TOKEN="your-token" \
npm run dev src/test-integration.ts
```

Or if using `.env`:

```bash
npm run dev src/test-integration.ts
```

### Test Execution Flow

The integration test suite runs the following tests in order:

1. **Connection Validation** (30-60ms)
   - Verifies the API token is valid
   - Confirms the Cloudron instance is accessible
   - Fails fast if credentials are invalid

2. **Get System Status** (50-150ms)
   - Fetches system health metrics
   - Displays Cloudron version and uptime
   - Validates response structure

3. **List Applications** (100-300ms)
   - Retrieves all installed apps
   - Shows first 3 apps with ID and status
   - Counts total number of applications

4. **Restart Application** (200-500ms)
   - Attempts safe restart of first application
   - Skipped if no apps exist
   - Includes safety confirmation output

## Example Test Output

```
╔════════════════════════════════════════╗
║  Cloudron MCP Integration Tests        ║
║  Phase 2.3: Real Instance Testing      ║
╚════════════════════════════════════════╝

Configuration:
  Base URL: https://my.serenichron.com
  Token: tmpt_abc12345...

✓ Client initialized successfully

════════════════════════════════════════
Running Tests
════════════════════════════════════════

▶ Testing: Connection Validation
✓ PASSED (45ms): Connection Validation

▶ Testing: Get System Status
  Version: 7.2.1
  Uptime: 168 hours
✓ PASSED (82ms): Get System Status

▶ Testing: List Applications
  Found 5 application(s)
    - Nextcloud (app-abc123) [running]
    - WordPress (app-def456) [running]
    - Mailu (app-ghi789) [running]
    ... and 2 more
✓ PASSED (156ms): List Applications

▶ Testing: Restart Application (Safety Test)
  ⚠  Attempting to restart: Nextcloud (app-abc123)
  Note: In production, this would require confirmation
  Restart initiated for Nextcloud
✓ PASSED (312ms): Restart Application (Safety Test)

════════════════════════════════════════
Test Summary
════════════════════════════════════════

✓ Connection Validation (45ms)
✓ Get System Status (82ms)
✓ List Applications (156ms)
✓ Restart Application (Safety Test) (312ms)

Results: 4 passed, 0 failed, 0 skipped / 4 total
Total Duration: 595ms

SUCCESS: All tests passed!
```

## Troubleshooting

### "Missing required environment variables"

**Symptom**: Test exits with this error message

**Solution**:
```bash
# Set environment variables
export CLOUDRON_BASE_URL="https://your-instance.com"
export CLOUDRON_API_TOKEN="your-token"

# Try again
npm run dev src/test-integration.ts
```

### "Invalid API token"

**Symptom**: Connection Validation test fails with 401 error

**Cause**: Token is invalid, expired, or doesn't have required permissions

**Solution**:
1. Log into your Cloudron Admin Panel
2. Go to API Tokens
3. Check if the token is still active
4. Create a new token if necessary
5. Update your environment/configuration

### "Failed to connect to Cloudron instance"

**Symptom**: Connection error to your base URL

**Causes**:
- Base URL is incorrect or unreachable
- Network connectivity issue
- Cloudron instance is down
- SSL certificate issue

**Solution**:
1. Verify the URL is correct: `curl -I https://your-instance.com`
2. Check internet connectivity: `ping google.com`
3. Verify Cloudron is running: Visit URL in browser
4. Check for SSL cert issues: `curl -v https://your-instance.com`

### "Timeout waiting for response"

**Symptom**: Test hangs for 30+ seconds then fails

**Causes**:
- Cloudron instance is slow or unresponsive
- Network latency is high

**Solution**:
- Increase timeout: `export CLOUDRON_TIMEOUT=60000` (60 seconds)
- Check Cloudron's server health
- Try again during off-peak hours

## Next Steps After Successful Testing

### 1. MCP Server Integration

The compiled MCP server is ready at `dist/index.js`:

```bash
# Start the MCP server
node dist/index.js
```

The server expects:
- `CLOUDRON_BASE_URL` environment variable
- `CLOUDRON_API_TOKEN` environment variable
- Listens on stdin/stdout (MCP protocol)

### 2. Docker MCP Gateway Integration

To add this to your Docker MCP Gateway configuration:

```yaml
mcpServers:
  cloudron:
    env:
      CLOUDRON_BASE_URL: "https://your-instance.com"
      CLOUDRON_API_TOKEN: "your-token"
    command: node
    args:
      - /path/to/dist/index.js
```

### 3. Expand Tool Coverage

Phase 2.2 implements the core 3 tools. Phase 3 will add:
- Domain management (list, add, configure)
- User/Group management
- Backup operations
- App installation/removal
- System updates

## Security Best Practices

1. **Never commit credentials**
   - Use `.env` files (in `.gitignore`)
   - Use environment variables in CI/CD
   - Use secrets management tools

2. **Rotate tokens regularly**
   - Generate new tokens periodically
   - Revoke old tokens
   - Monitor token usage

3. **Limit token permissions**
   - Create tokens with minimum required permissions
   - Use separate tokens for different integrations
   - Document which token is used where

4. **Monitor API usage**
   - Check Cloudron's API usage logs
   - Alert on unusual patterns
   - Review successful and failed requests

## Testing Against Multiple Instances

To test against multiple Cloudron instances:

```bash
# Test instance 1
CLOUDRON_BASE_URL="https://instance1.com" \
CLOUDRON_API_TOKEN="token1" \
npm run dev src/test-integration.ts

# Test instance 2
CLOUDRON_BASE_URL="https://instance2.com" \
CLOUDRON_API_TOKEN="token2" \
npm run dev src/test-integration.ts
```

## Continuous Integration

For CI/CD pipeline testing:

```yaml
# GitHub Actions example
env:
  CLOUDRON_BASE_URL: ${{ secrets.CLOUDRON_BASE_URL }}
  CLOUDRON_API_TOKEN: ${{ secrets.CLOUDRON_API_TOKEN }}

- name: Run Integration Tests
  run: npm run dev src/test-integration.ts
```

## Reporting Issues

If tests fail, please include:

1. **Test output** (full output from test run)
2. **Your Cloudron version** (from test output or Admin panel)
3. **Network details** (are you behind a firewall/proxy?)
4. **Environment** (OS, Node.js version)
5. **Reproduction steps**

## Questions or Issues?

- Check the Cloudron API documentation: https://docs.cloudron.io/api.html
- Review MCP Protocol docs: https://modelcontextprotocol.io
- Check project repository issues

---

**Last Updated**: 2025-12-11
**Phase**: 2.3 - Integration Testing
**Status**: Ready for User Testing
