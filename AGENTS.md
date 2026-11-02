# mcp-cloudron

MCP server (stdio) exposing the Cloudron REST API as 36 `cloudron_*` tools. Published as `@serenichron/mcp-cloudron`; the repo is public, so keep hostnames, tokens and client data out of commits.

## Commands

- `npm run build`: compile `src/` to `dist/` with `tsc`.
- `npm run lint`: type-check only (`tsc --noEmit`).
- `npm test`: Jest over `tests/**/*.test.ts`, against the mock in `tests/helpers/cloudron-mock.ts`. No network needed.

## Layout

- `src/cloudron-client.ts`: HTTP client, one method per Cloudron endpoint. Reads `CLOUDRON_BASE_URL` and `CLOUDRON_API_TOKEN`.
- `src/server.ts`: tool schemas (`ListToolsRequestSchema`) and the `CallToolRequestSchema` switch that dispatches each `cloudron_*` tool.
- `src/types.ts`: API response types.

To add a tool, follow "Adding New Tools" in `CONTRIBUTING.md` (client method, types, schema plus `case` in `server.ts`, test, README).

## Live API

`src/test-integration.ts` runs against the real Cloudron in `CLOUDRON_BASE_URL` and restarts the first app it lists. Run it only with the user's go-ahead, and preferably against a test instance, because against `my.serenichron.agency` that restarts a production app.
