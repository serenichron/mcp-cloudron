/**
 * Cloudron API Client
 * Wraps the Cloudron REST API with authentication, retry logic, and error handling
 */
import type { App, CloudronConfig, GetStatusInput, ListAppsInput, RestartAppInput, SystemStatus } from './types.js';
/**
 * Cloudron API Client
 * Handles authentication, HTTP requests, and retry logic
 */
export declare class CloudronClient {
    private baseUrl;
    private token;
    private timeout;
    private retryAttempts;
    private retryDelay;
    /**
     * Creates a new Cloudron API client
     * @param config - Client configuration
     * @throws {CloudronConfigError} If configuration is invalid
     */
    constructor(config: CloudronConfig);
    /**
     * Makes an HTTP request to the Cloudron API with retry logic
     * @private
     * @param method - HTTP method (GET, POST, etc.)
     * @param path - API endpoint path (e.g., '/api/v1/apps')
     * @param body - Request body (optional)
     * @returns Parsed JSON response
     */
    private fetchWithRetry;
    /**
     * Lists all installed applications
     * @param _input - List apps input (currently unused)
     * @returns Array of installed applications
     */
    listApps(_input: ListAppsInput): Promise<App[]>;
    /**
     * Gets system status and health
     * @param _input - Get status input (currently unused)
     * @returns Current system status
     */
    getStatus(_input: GetStatusInput): Promise<SystemStatus>;
    /**
     * Restarts a specific application
     * @param input - Restart app input with appId
     * @returns Success status
     */
    restartApp(input: RestartAppInput): Promise<void>;
    /**
     * Validates that the Cloudron instance is accessible
     * Called during initialization to verify configuration
     * @throws {CloudronAuthError} If token is invalid
     * @throws {Error} If instance is unreachable
     */
    validateConnection(): Promise<void>;
}
//# sourceMappingURL=cloudron-client.d.ts.map