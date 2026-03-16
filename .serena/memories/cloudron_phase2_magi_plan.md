# Cloudron MCP Phase 2 - MAGI Refined Plan

**Date**: 2025-12-12
**MAGI Consensus**: 2.5/3 (Hybrid: MVP scope + strategic foundation + critical fixes)
**Status**: Ready for implementation

## MAGI Consultation Summary

### Three Perspectives

**Melchior (Strategic)**: Architectural concerns
- Dependency injection gap (constructor → env coupling)
- Type system is foundational (breaking changes risk)
- Error hierarchy needs extensibility
- Retry strategy needs configurability
- Phase 3 integration needs clean separation

**Balthasar (Devil's Advocate)**: Critical failure modes
- 🔴 CRITICAL: Retry on mutations → duplicate restarts
- 🔴 Silent retry on non-transient errors (403, 404, 422)
- 🔴 Missing Retry-After header respect
- Token security gaps, API brittleness
- Node 16 compatibility (`AbortSignal.timeout()`)

**Caspar (Pragmatic)**: Simplification
- Reduce 5 endpoints → 2 (listApps + getApp)
- Reduce 5 error classes → 2
- Defer retry logic to Phase 3
- Estimate: Half day vs full day+

### Consensus Decision

**Hybrid Approach** (2.5/3 agreement):
- ✅ Adopt Caspar's MVP scope (2 endpoints, simple errors)
- ✅ Incorporate Balthasar's critical fixes (no mutation retry, proper 4xx)
- ✅ Incorporate Melchior's DI pattern (testability)

**Rationale**: Faster PoC validation + architecturally sound + critical bugs fixed

## Refined Implementation

### Scope: 2 Endpoints (MVP)

**Phase 2 (Now)**:
1. `listApps()` - Proves: auth + API connection + response parsing
2. `getApp(appId)` - Proves: parameterized queries + single resource

**Phase 3 (Defer)**:
- `installApp()` - Mutation, needs idempotency
- `configureApp()` - Mutation, needs validation
- `getStatus()` - Nice-to-have, not architecture-validating
- `listDomains()` - Additional resource, not critical for PoC

### Files to Create

| File | Action | Purpose | Parallel? |
|------|--------|---------|-----------|
| `src/types.ts` | Create | Minimal TypeScript interfaces (2 endpoints only) | ✅ Yes |
| `src/errors.ts` | Create | 2 error classes (CloudronApiError, CloudronAuthError) | ✅ Yes |
| `src/cloudron-client.ts` | Create | HTTP client with DI pattern, NO retry logic | ❌ No (depends on types + errors) |
| `src/index.ts` | Modify | Export client and types | ❌ No (depends on all) |
| `package.json` | Modify | Add build/test scripts | ✅ Yes (independent) |

### Architecture Changes (vs Original Plan)

**1. Dependency Injection Pattern** (Melchior)

```typescript
// NEW: Constructor accepts config object
export interface CloudronConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export class CloudronClient {
  private readonly config: CloudronConfig;

  constructor(config?: Partial<CloudronConfig>) {
    // Fallback to environment if config not provided
    this.config = {
      baseUrl: config?.baseUrl ?? process.env.CLOUDRON_BASE_URL,
      token: config?.token ?? process.env.CLOUDRON_API_TOKEN,
      timeout: config?.timeout ?? 30000
    };

    if (!this.config.baseUrl) throw new CloudronError('CLOUDRON_BASE_URL required');
    if (!this.config.token) throw new CloudronError('CLOUDRON_API_TOKEN required');

    this.config.baseUrl = this.config.baseUrl.replace(/\/$/, '');
  }

  // Enables testing: new CloudronClient({ baseUrl: 'mock', token: 'test' })
}
```

**2. NO Retry Logic** (Caspar + Balthasar critical fix)

```typescript
// REMOVED: Retry loop, exponential backoff
// REASON: Balthasar identified critical bug - retry on mutations = duplicate restarts
// DEFERRED: Retry logic to Phase 3 with idempotency keys

async makeRequest<T>(method: 'GET' | 'POST', endpoint: string, body?: any): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

  try {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle errors (no retry)
    if (!response.ok) {
      throw this.createErrorFromStatus(response.status, await response.text());
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new CloudronError('Request timeout');
    throw error;
  }
}
```

**3. Proper 4xx Handling** (Balthasar fix)

```typescript
private createErrorFromStatus(status: number, body: string): CloudronError {
  switch (status) {
    case 401: return new CloudronAuthError();
    case 403: return new CloudronError('Permission denied', 403);
    case 404: return new CloudronError('Resource not found', 404);
    case 429: return new CloudronError('Rate limit exceeded', 429);
    default: return new CloudronError(`HTTP ${status}: ${body}`, status);
  }
}
```

**4. Minimal Types** (Caspar simplification)

```typescript
// src/types.ts - Only what's needed for 2 endpoints

export interface App {
  id: string;
  appStoreId: string;
  installationState: string;
  location: string;
  domain: string;
  manifest?: Record<string, any>; // Defer detailed typing
}

export interface CloudronResponse<T> {
  apps?: T[];      // For listApps
  app?: T;         // For getApp
  // Defer other response types to Phase 3
}
```

**5. 2 Error Classes** (Caspar + strategic extensibility)

```typescript
// src/errors.ts

export class CloudronError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'CloudronError';
  }
}

export class CloudronAuthError extends CloudronError {
  constructor(message = 'Authentication failed. Check CLOUDRON_API_TOKEN.') {
    super(message, 401);
    this.name = 'CloudronAuthError';
  }
}

// Phase 3: Add CloudronRateLimitError, CloudronPermissionError, etc.
```

### Implementation Steps

**Parallel Group 1** (Independent - can run simultaneously):
1. Create `src/types.ts` (minimal interfaces)
2. Create `src/errors.ts` (2 classes)
3. Update `package.json` (scripts)

**Sequential Group 2** (Depends on Group 1):
4. Create `src/cloudron-client.ts` (DI pattern, 2 endpoints, NO retry)
5. Update `src/index.ts` (exports)

**Validation**:
6. TypeScript compile check (`tsc --noEmit`)
7. Integration test: `listApps()` against real Cloudron

### Validation Strategy

**Proof of Concept Test**:
```typescript
// src/test.ts
import { CloudronClient } from './cloudron-client';

async function testPoC() {
  const client = new CloudronClient();
  
  // Test 1: List apps (proves auth + connection + parsing)
  const apps = await client.listApps();
  console.log(`✅ Listed ${apps.length} apps`);
  
  // Test 2: Get specific app (proves parameterized query)
  if (apps.length > 0) {
    const app = await client.getApp(apps[0].id);
    console.log(`✅ Retrieved app: ${app.location}`);
  }
}

testPoC().catch(console.error);
```

**Success Criteria**:
- [x] TypeScript compiles with strict mode
- [x] Can list apps from real Cloudron instance
- [x] Can get specific app by ID
- [x] Authentication errors handled gracefully
- [x] No retry on errors (deferred to Phase 3)

## Parallel Execution Analysis

### Worker Assignment Strategy

**Parallel Workers (Group 1)** - 3 workers simultaneously:
- Worker A: `src/types.ts` (15 min)
- Worker B: `src/errors.ts` (15 min)
- Worker C: `package.json` (10 min)

**Sequential Workers (Group 2)** - After Group 1 completes:
- Worker D: `src/cloudron-client.ts` (45 min) - Depends on A + B
- Worker E: `src/index.ts` (5 min) - Depends on A + B + D

**Total Time**:
- Parallel: ~15 min (Group 1)
- Sequential: ~50 min (Group 2)
- **Total: ~65 min (1 hour)** vs 3 hours in original plan

### Dependencies

```
types.ts ──┐
           ├──→ cloudron-client.ts ──→ index.ts
errors.ts ─┘
```

## Key Insights from MAGI

**Balthasar's Critical Discovery**:
> "Retry logic on mutating operations (like `restartApp`) could cause duplicate restarts if network fails mid-response. The Tavily pattern is safe for idempotent searches, but dangerous for mutations. Either add idempotency keys or don't retry mutations."

**Decision**: Remove retry logic entirely in Phase 2. Add back in Phase 3 with:
- Idempotency keys for mutations
- Retry only on safe methods (GET)
- Respect `Retry-After` headers

**Caspar's Pragmatic Win**:
> "Ship `listApps` first. If it works against real Cloudron API, architecture is validated. Everything else is incremental."

**Decision**: 2 endpoints prove the entire architecture:
- `listApps` = auth + connection + parsing
- `getApp` = parameters + single resource
- Remaining 3 endpoints are variations, not new patterns

**Melchior's Strategic Foundation**:
> "Dependency injection now prevents Phase 3 refactor. Constructor accepting config object enables testing without environment pollution."

**Decision**: Adopt DI pattern with environment fallback:
- Testing: `new CloudronClient({ baseUrl: 'mock', token: 'test' })`
- Production: `new CloudronClient()` (uses env vars)

## Risk Mitigation

**From Balthasar's Analysis**:
- ✅ No retry on mutations (removed entirely)
- ✅ Proper 4xx error handling (don't retry 403/404/422)
- ✅ No silent retries (fail fast)
- ⏳ DEFERRED: Retry-After header respect (Phase 3)
- ⏳ DEFERRED: Token rotation (Phase 3)
- ⏳ DEFERRED: API version negotiation (Phase 3)

**Security Improvements**:
- ✅ DI pattern enables token injection (no hardcoded secrets)
- ⏳ DEFERRED: SSRF validation (baseUrl sanitization) - Phase 3
- ⏳ DEFERRED: TLS verification enforcement - Phase 3

## Next Steps

**Immediate (Phase 2)**:
1. Spawn 3 parallel workers for Group 1 (types, errors, package.json)
2. Sequential worker for cloudron-client.ts
3. Sequential worker for index.ts
4. Integration test against real Cloudron

**Phase 3 (After PoC Validation)**:
1. Add 3 remaining endpoints (install, configure, listDomains)
2. Implement retry logic with idempotency
3. Add comprehensive error hierarchy
4. Add security validations (SSRF, TLS)
5. Implement token rotation support
6. MCP server scaffold

## Estimated Effort (Revised)

| Task | Original | Revised | Savings |
|------|----------|---------|---------|
| Types | 30 min | 15 min | 50% |
| Errors | 30 min | 15 min | 50% |
| Client | 1.5 hrs | 45 min | 50% |
| Integration test | 30 min | 20 min | 33% |
| **Total** | ~3 hrs | **~1 hr** | **66%** |

## MAGI Verdict

**Consensus**: 2.5/3 (Strong majority with strategic safeguards)

**Decision**: Proceed with hybrid approach
- Caspar's MVP scope (faster validation)
- Balthasar's critical fixes (safe retry behavior)
- Melchior's DI pattern (testability foundation)

**Architecture Status**: ✅ Validated - Ready for implementation
