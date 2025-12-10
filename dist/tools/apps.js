/**
 * Application Management Tools
 * MCP tool schemas for Cloudron app operations
 */
export const APP_TOOLS = [
    {
        name: 'cloudron_list_apps',
        description: 'List all installed applications on the Cloudron instance. Returns app details including name, status, location, and resource allocation.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'cloudron_restart_app',
        description: 'Restart a specific application by ID. Use this to apply configuration changes or recover from errors.',
        inputSchema: {
            type: 'object',
            properties: {
                appId: {
                    type: 'string',
                    description: 'Unique identifier of the application to restart',
                },
            },
            required: ['appId'],
        },
    },
];
//# sourceMappingURL=apps.js.map