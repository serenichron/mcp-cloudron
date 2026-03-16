# Real API Testing Results - 2025-12-26

## Mission
Test F01, F05, F06, F22 against real Cloudron API at https://my.serenichron.agency

## Test Results

### ✅ F01: cloudron_control_app - PASSED
**Status**: Working correctly

**Test**: Restart app operation
- Endpoint: `POST /api/v1/apps/{appId}/restart`
- Response: `{ taskId: '2742' }`
- Verification: Returns taskId for async operation tracking

**No bugs found**.

---

### ❌ F05: cloudron_configure_app - FAILED
**Status**: Wrong endpoint (404 Not Found)

**Current implementation**:
```typescript
PUT /api/v1/apps/${appId}/configure
```

**Error**: `No such route`

**Root cause**: The `/configure` endpoint does not exist or requires different HTTP method.

**Investigation**:
- Tested OPTIONS request: Only GET, HEAD allowed for `/api/v1/apps/{appId}`
- Tested POST: Still 404
- Tested PUT: 404

**Conclusion**: The `configure` endpoint likely doesn't exist in this Cloudron version (9.0.15), or configuration is done via different endpoint (possibly direct PUT to `/api/v1/apps/{appId}` with full app object).

**Action needed**:
1. Check Cloudron API docs for correct configuration endpoint
2. May need to use PUT /api/v1/apps/{appId} with full app payload
3. Update implementation and retest

---

### ❌ F06: cloudron_get_logs - FAILED
**Status**: Wrong response handling (JSON parsing error)

**Current implementation**:
```typescript
GET /api/v1/apps/${appId}/logs?lines=${lines}
const response = await this.makeRequest<LogsResponse>('GET', endpoint);
// Expects JSON response: { logs: [...] }
```

**Error**: `Network error: Unexpected non-whitespace character after JSON at position 256 (line 2 column 1)`

**Root cause**: The logs endpoint returns **raw text** (NDJSON or plain text), not JSON object with `{ logs: [...] }` wrapper.

**Investigation**:
- API returned 401 Unauthorized when testing directly (token may need different permissions for logs)
- Response format is likely newline-delimited JSON or plain text lines
- Current code expects `{ logs: [...] }` JSON object

**Action needed**:
1. Update makeRequest to handle non-JSON responses (add `Accept: text/plain` header option)
2. Parse raw text/NDJSON response into log entries
3. Check token permissions for logs endpoint
4. Retest with corrected implementation

---

### ❌ F22: cloudron_search_apps - FAILED
**Status**: Wrong endpoint (404 Not Found)

**Current implementation**:
```typescript
GET /api/v1/appstore?search=${query}
// or
GET /api/v1/appstore
```

**Error**: `No such route`

**Correct endpoint**:
```typescript
GET /api/v1/appstore/apps
```

**Investigation**:
- Tested `/api/v1/appstore` → 404 "No such route"
- Tested `/api/v1/appstore/apps` → 200 OK, returns `{ apps: [...] }`

**Action needed**:
1. Change endpoint from `/api/v1/appstore` to `/api/v1/appstore/apps`
2. Search query parameter may need verification (use `search=` or different param)
3. Retest with corrected endpoint

---

## Summary

| Tool | Status | Bug Found | Fix Required |
|------|--------|-----------|--------------|
| F01 | ✅ PASSED | None | No |
| F05 | ❌ FAILED | Wrong endpoint (404) | Yes - find correct configure endpoint |
| F06 | ❌ FAILED | Wrong response format (JSON parsing error) | Yes - handle text/NDJSON response |
| F22 | ❌ FAILED | Wrong endpoint (404) | Yes - use `/api/v1/appstore/apps` |

**Results**: 1/4 tools working (25%)

**Bugs found**: 3 critical bugs that mock tests completely missed

## Critical Lesson

**Mock tests provided ZERO value**. All 3 bugs were endpoint/response format issues that mocks couldn't catch.

**Only real API testing reveals**:
1. Actual endpoint paths used by server
2. Actual response formats (JSON vs text)
3. Authentication/permission requirements
4. API version differences

## Next Steps

1. Fix F22 first (easiest - just endpoint change)
2. Fix F06 second (response handling change)
3. Fix F05 last (need to research correct endpoint)
4. Retest all 3 with real API
5. Update domain memory with honest status
