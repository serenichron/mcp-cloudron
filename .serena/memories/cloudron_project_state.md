# Cloudron MCP Project State

**Last Updated**: 2025-12-12
**Current Phase**: 2 (Implementation - MAGI Planning Complete)
**Status**: Ready for parallel execution

## Project Context

**Purpose**: Build MCP server for Cloudron instance management
**Integration**: SuperClaude framework via Docker MCP Gateway
**Location**: `/home/blackthorne/Work/cloudron`

## Phase History

### Phase 1: Research & Architecture ✅ Complete
- Cloudron API research (Serena: `cloudron_api_research`)
- Architecture design (Serena: `cloudron_mcp_architecture`)
- Initial plan creation (`~/.claude/plans/abundant-toasting-diffie.md`)

### Phase 2: MAGI Strategic Planning ✅ Complete (2025-12-12)

**MAGI Consultation**: ultrathink keyword triggered full triad analysis

**Three Perspectives**:
1. **Melchior (Strategic)**: Architectural safeguards needed
   - Dependency injection for testability
   - Type system extensibility
   - Clean Phase 3 integration surface

2. **Balthasar (Devil's Advocate)**: Critical bugs identified
   - 🔴 Retry on mutations = duplicate restarts
   - 🔴 Silent retry on non-transient errors
   - 🔴 Missing rate limit header respect

3. **Caspar (Pragmatic)**: Scope reduction recommended
   - 5 endpoints → 2 (listApps + getApp)
   - 5 error classes → 2
   - Defer retry logic to Phase 3

**Consensus**: 2.5/3 (Hybrid approach)
- MVP scope (Caspar) + strategic foundation (Melchior) + critical fixes (Balthasar)
- Refined plan: Serena memory `cloudron_phase2_magi_plan`

**Key Decisions**:
- ✅ Reduce to 2 endpoints for PoC validation
- ✅ Add dependency injection pattern
- ✅ Remove retry logic (defer to Phase 3 with idempotency)
- ✅ Proper 4xx error handling (no retry on 403/404/422)
- ✅ Parallel execution: 3 workers for types/errors/package.json

**Time Estimate**: 1 hour (vs 3 hours original) - 66% reduction

### Phase 2: Implementation (Next - Ready to Execute)

**Parallel Group 1** (3 workers simultaneously):
- Worker A: `src/types.ts` (15 min)
- Worker B: `src/errors.ts` (15 min)
- Worker C: `package.json` (10 min)

**Sequential Group 2** (after Group 1):
- Worker D: `src/cloudron-client.ts` (45 min)
- Worker E: `src/index.ts` (5 min)

**Validation**: Integration test with real Cloudron instance

### Phase 3: MCP Server & Integration (Future)

**Scope**:
- Add 3 remaining endpoints (install, configure, listDomains)
- Implement retry logic with idempotency keys
- Comprehensive error hierarchy
- Security validations (SSRF, TLS)
- MCP server scaffold with stdio transport
- SuperClaude agent creation

## Current Status

**Ready for**: Phase 2 implementation (parallel workers)
**Blocking**: None - MAGI planning complete
**Next Action**: Spawn 3 parallel workers for Group 1

## Key Files

**Plans**:
- Original plan: `~/.claude/plans/abundant-toasting-diffie.md`
- MAGI refined: Serena `cloudron_phase2_magi_plan`

**Research**:
- API research: Serena `cloudron_api_research`
- Architecture: Serena `cloudron_mcp_architecture`

**Reference Patterns**:
- Tavily client: `~/.claude/servers/tavily/src/client.ts`
- Tavily types: `~/.claude/servers/tavily/src/types.ts`

## Architecture Decisions (MAGI-Approved)

**Dependency Injection Pattern**:
```typescript
new CloudronClient({ baseUrl, token }) // Testing
new CloudronClient() // Production (env vars)
```

**No Retry Logic** (Phase 2):
- Reason: Balthasar identified critical bug (retry on mutations)
- Deferred: Phase 3 with idempotency keys

**Minimal Types** (Phase 2):
- Only interfaces needed for 2 endpoints
- Extensibility deferred to Phase 3

**2 Error Classes** (Phase 2):
- CloudronError (base)
- CloudronAuthError (401)
- Remaining errors deferred to Phase 3

## Success Metrics (Phase 2)

- [x] MAGI consensus reached (2.5/3)
- [ ] TypeScript compiles with strict mode
- [ ] Can list apps from real Cloudron instance
- [ ] Can get specific app by ID
- [ ] No retry behavior (deferred to Phase 3)
- [ ] Integration test passes

## Parallel Execution Gains

**Original Plan**: 3 hours sequential
**MAGI Plan**: 1 hour with parallelization (66% reduction)

**Parallelization Strategy**:
- Group 1: types + errors + package.json (15 min)
- Group 2: client + index (50 min sequential)

## Risk Mitigation (From Balthasar)

**Critical Fixes Applied**:
- ✅ No retry on mutations (removed entirely)
- ✅ Proper 4xx error handling
- ✅ Fail fast (no silent retries)

**Deferred to Phase 3**:
- Retry-After header respect
- Token rotation support
- API version negotiation
- SSRF validation
- TLS enforcement

## Next Steps

1. Spawn 3 parallel workers (types, errors, package.json)
2. Sequential worker for cloudron-client.ts
3. Sequential worker for index.ts
4. Integration test with real Cloudron
5. Phase 3 planning (after PoC validation)

## Contact

**Project Owner**: Vlad (vlad@serenichron.com)
**Cloudron Instance**: TBD (user has test instance)
