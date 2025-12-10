/**
 * Cloudron MCP Tool Definitions
 * Registry of all available tools for the MCP server
 */
import { APP_TOOLS } from './apps.js';
import { SYSTEM_TOOLS } from './system.js';
/**
 * All tool definitions exported for MCP server ListTools handler
 */
export const TOOL_DEFINITIONS = [
    ...APP_TOOLS,
    ...SYSTEM_TOOLS,
];
//# sourceMappingURL=index.js.map