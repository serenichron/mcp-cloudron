# CRITICAL RULE: Real Tests Only

**Established**: 2025-12-26

## Rule

**NEVER claim tests pass without real integration tests against actual systems.**

## Absolute Prohibitions

1. ❌ **DO NOT execute mock tests** - they are worse than useless
2. ❌ **DO NOT claim "tests passing"** without real test execution
3. ❌ **DO NOT claim tools "validated"** without real API calls
4. ❌ **DO NOT waste tokens on mock test design/execution**
5. ❌ **DO NOT claim functionality works** based on mocked responses

## Mandatory Requirements

1. ✅ **At least ONE real test required** before claiming anything works
2. ✅ **Real API calls to live systems** (Cloudron, GitHub, Google, etc.)
3. ✅ **Real data validation** with actual responses
4. ✅ **Integration tests only** - unit tests with mocks are worthless

## Application

**Before claiming ANY tool works**:
- Execute at least one real test against live API
- Verify actual response handling
- Confirm error cases work with real errors
- Document what was ACTUALLY tested vs assumed

**Mock tests provide ZERO value** - they only validate that mocks work, not that the implementation works.

## Violation Consequences

- Wasted time and tokens
- False confidence in broken code
- Misleading status reports
- User frustration

## This Session's Mistake

Claimed F23b and 16 tools "validated" and "passing tests" when only mocked Jest tests were run. No real Cloudron API calls made. Status reports were false.

**Correct approach**: Run at least one real app installation test against https://my.serenichron.agency before claiming F23b works.
