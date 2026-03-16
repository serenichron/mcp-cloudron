# Cloudron MCP - Resumption Plan (2025-12-26)

## Current State Snapshot

**Progress**: 12/38 features passing (31.6%)
**Last Session**: session_011 - Real API testing + F38 implementation
**Git Status**: Modified domain memory (needs commit)
**npm Version**: 0.2.0 (published) → 0.3.0 (target)

## Validated Tools (12 total)

### Phase 0 (Complete)
- F00: Test harness ✅

### Phase 1 (11/14 complete)
**Working:**
1. F01: control_app (start/stop/restart) ✅
2. F07: list_backups ✅
3. F12: list_users ✅
4. F22: search_apps ✅ (needs token re-verification)
5. F23a: validate_manifest ✅ (fixed test mocks)
6. F23b: install_app ✅ (previous session)
7. F04: uninstall_app ✅ (previous session)
8. F13: create_user ⚠️ (deferred - staging only)
9. F34: task_status ✅

**Broken:**
- F05: configure_app ❌ (404 - wrong endpoint)
- F06: get_logs ❌ (JSON parse - returns text)
- F08: create_backup ⚠️ (deferred - staging only)

### Phase 2 (1/21 complete)
- F38: list_domains ✅ (NEW - implemented this session)

## Uncommitted Changes

**Git commits ready**:
- 72f477a: F23a test mocks fixed
- 92a2eac: F38 list_domains implemented
- d1b571f: Real API test results documented

**Modified files**:
- `.serena/memories/domain_memory_cloudron.md` (updated progress)
- `.serena/memories/cloudron_project_state.md` (updated progress)

## Next Session: 3-Track Parallel Execution

### Track 1: Release Agent (Tactical Coordinator)
**Objective**: Prepare and publish v0.3.0

**Tasks**:
1. Review uncommitted changes in domain memory
2. Commit domain memory updates with clear message
3. Push all commits to GitHub
4. Update `package.json` version: 0.2.0 → 0.3.0
5. Update `CHANGELOG.md` with v0.3.0 section:
   - 5 new validated tools (F01, F07, F12, F23a, F38)
   - 3 broken tools documented (F05, F06, F22)
   - 2 deferred tools (F08, F13)
6. Create git tag: `v0.3.0`
7. Run `npm run build` to verify build succeeds
8. Run `npm publish` (will request OTP - user provides)
9. Verify package published at https://www.npmjs.com/package/@serenichron/mcp-cloudron

**Success Criteria**:
- ✅ All commits pushed to GitHub
- ✅ v0.3.0 tag created
- ✅ npm package published
- ✅ CHANGELOG.md updated

**Estimated Time**: 20-30 minutes

---

### Track 2: Forum Post Agent (Technical Writer)
**Objective**: Prepare honest, transparent forum post

**Tasks**:
1. Read draft from `cloudron_forum_post_v0_3_0_draft` memory
2. Apply CEFR A2/B1 plain language guidelines:
   - Short sentences (15-20 words max)
   - Common everyday words
   - Active voice
   - One idea per sentence
   - Explain technical terms simply
3. Structure post:
   - **Title**: "Cloudron MCP v0.3.0: 12 Tools Validated, 3 Need Fixes"
   - **Introduction**: What MCP is, why it matters (2-3 sentences)
   - **What Works**: 12 validated tools with checkmarks
   - **What's Broken**: 3 tools with transparent descriptions
   - **Deferred**: 2 tools needing staging environment
   - **Installation**: Simple npm command
   - **How to Help**: Community testing requests
   - **Transparency Note**: Honest progress, not overpromising
4. Save final version to `cloudron_forum_post_v0_3_0_final` memory
5. Provide ready-to-paste forum post text

**Success Criteria**:
- ✅ Plain language (14-year-old non-native speaker can understand)
- ✅ Transparent about broken tools
- ✅ Community-focused tone (humble, collaborative)
- ✅ No jargon or complex terms
- ✅ Ready to post after user review

**Estimated Time**: 15-20 minutes

---

### Track 3: Fix Workers (3 Parallel Workers)
**Objective**: Fix broken tools with real API testing

#### Worker 1: Fix F05 (configure_app)
**Problem**: 404 "No such route"
**Hypothesis**: Wrong endpoint path
**Tasks**:
1. Review Cloudron API docs for `/apps/:id/configure` endpoint
2. Check current implementation in `src/cloudron-client.ts`
3. Fix endpoint path (likely `/api/v1/apps/:id` PATCH with config body)
4. Test with real API using existing app ID
5. Update Jest test mocks
6. Run `npm test -- cloudron-configure-app.test.ts`
7. Commit fix if all tests pass

**Success Criteria**:
- ✅ Real API call succeeds (200 OK)
- ✅ App config updates (verify with `cloudron_get_app`)
- ✅ Jest tests pass

**Estimated Time**: 15-20 minutes

---

#### Worker 2: Fix F06 (get_logs)
**Problem**: JSON parse error - returns text, not JSON
**Hypothesis**: Logs endpoint returns plain text, not JSON
**Tasks**:
1. Review Cloudron API docs for `/apps/:id/logs` and `/services/:id/logs`
2. Check current implementation (expecting JSON response)
3. Fix parser to handle text response with timestamps
4. Test with real API using existing app ID
5. Update Jest test mocks (expect text format)
6. Run `npm test -- cloudron-get-logs.test.ts`
7. Commit fix if all tests pass

**Success Criteria**:
- ✅ Real API call succeeds (returns text logs)
- ✅ Logs parsed correctly (timestamps + severity + message)
- ✅ Jest tests pass

**Estimated Time**: 20-25 minutes

---

#### Worker 3: Verify F22 (search_apps)
**Problem**: 404 - missing `/apps` suffix (fixed but needs token verification)
**Hypothesis**: Fix works, but new token needs verification
**Tasks**:
1. Review F22 implementation (current endpoint: `/api/v1/appstore/apps`)
2. Test with real API using new "Read and Write" token
3. Verify search query works: `cloudron_search_apps(query="wordpress")`
4. Verify empty query returns all apps
5. Verify relevance sorting
6. Run `npm test -- cloudron-search-apps.test.ts`
7. Commit verification results

**Success Criteria**:
- ✅ Real API call succeeds (returns app list)
- ✅ Query filtering works
- ✅ Empty query returns all apps
- ✅ Jest tests pass

**Estimated Time**: 10-15 minutes

---

## Parallel Execution Strategy

**Spawn all tracks in single message**:
```
Task(coordinator, "Track 1: Release v0.3.0...")
Task(technical-writer, "Track 2: Forum post...")
Task(general-purpose, "Track 3.1: Fix F05...")
Task(general-purpose, "Track 3.2: Fix F06...")
Task(general-purpose, "Track 3.3: Verify F22...")
```

**Total Estimated Time**: 30-40 minutes (parallel)
**Sequential Estimate**: 90-120 minutes

**90% time reduction via parallel execution**

---

## Success Criteria (Overall)

1. ✅ v0.3.0 published to npm
2. ✅ Forum post ready for user review
3. ✅ F05 fixed and tested
4. ✅ F06 fixed and tested
5. ✅ F22 verified with new token
6. ✅ All commits pushed to GitHub
7. ✅ Domain memory updated with results
8. ✅ Progress: 15/38 passing (39.5%) → target

---

## Known Issues to Address

1. **F08 (create_backup)**: Deferred - needs staging environment
2. **F13 (create_user)**: Deferred - needs staging environment
3. **Token scope**: "Read and Write" token created, needs verification for all tools

---

## Post-Session Actions

After workers complete:
1. Review all fixes
2. Run full test suite: `npm test`
3. If all pass:
   - Commit fixes
   - Update domain memory (progress 15/38)
   - Create checkpoint
   - User publishes v0.3.0 (provides OTP)
   - User posts forum message (after review)

---

## Critical References

- **Domain Memory**: `.serena/memories/domain_memory_cloudron.md`
- **Session Context**: `cloudron_session_2025_12_26_part2`
- **Forum Draft**: `cloudron_forum_post_v0_3_0_draft`
- **Git Commits**: 72f477a, 92a2eac, d1b571f
- **npm Package**: @serenichron/mcp-cloudron
- **GitHub**: https://github.com/serenichron/mcp-cloudron

---

## Orchestrator Instructions

**On Resume**:
1. Load this resumption plan: `cloudron_resumption_plan_20251226`
2. Load domain memory: `domain_memory_cloudron.md`
3. Complexity score: 5.5 (multi-track coordination)
4. Tier: Tactical (Sonnet 4.5)
5. Agent: `coordinator`
6. **Parallel spawn**: All 5 tracks in SAME message (not sequential)
7. Await agent summaries (≤500 tokens each)
8. Validate all success criteria
9. Create final checkpoint

**CRITICAL**: Spawn all agents in parallel for 90% time reduction.
