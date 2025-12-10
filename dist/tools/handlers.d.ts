/**
 * Tool Handler Functions
 * Implements MCP tool execution by calling Cloudron API client
 */
import { CloudronClient } from '../cloudron-client.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * Handle cloudron_list_apps tool call
 */
export declare function handleListApps(client: CloudronClient, _args: Record<string, unknown>): Promise<CallToolResult>;
/**
 * Handle cloudron_restart_app tool call
 */
export declare function handleRestartApp(client: CloudronClient, args: Record<string, unknown>): Promise<CallToolResult>;
/**
 * Handle cloudron_status tool call
 */
export declare function handleStatus(client: CloudronClient, _args: Record<string, unknown>): Promise<CallToolResult>;
//# sourceMappingURL=handlers.d.ts.map