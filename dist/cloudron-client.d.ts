/**
 * Cloudron API Client
 * MVP scope: listApps + getApp endpoints
 * DI-enabled for testing
 */
import type { CloudronClientConfig, App, SystemStatus, TaskStatus, StorageInfo } from './types.js';
export declare class CloudronClient {
    private readonly baseUrl;
    private readonly token;
    /**
     * Create CloudronClient with DI support
     * @param config - Optional config (defaults to env vars)
     */
    constructor(config?: Partial<CloudronClientConfig>);
    /**
     * Make HTTP request to Cloudron API
     * NO retry logic (deferred to Phase 3 with idempotency keys)
     */
    private makeRequest;
    /**
     * List all installed apps
     * GET /api/v1/apps
     */
    listApps(): Promise<App[]>;
    /**
     * Get a specific app by ID
     * GET /api/v1/apps/:appId
     *
     * Note: API returns app object directly, not wrapped in { app: {...} }
     */
    getApp(appId: string): Promise<App>;
    /**
     * Get Cloudron system status
     * GET /api/v1/cloudron/status
     */
    getStatus(): Promise<SystemStatus>;
    /**
     * Get task status for async operations
     * GET /api/v1/tasks/:taskId
     */
    getTaskStatus(taskId: string): Promise<TaskStatus>;
    /**
     * Check available disk space for pre-flight validation
     * GET /api/v1/cloudron/status (reuses existing endpoint)
     * @param requiredMB - Optional required disk space in MB
     * @returns Storage info with availability and threshold checks
     */
    checkStorage(requiredMB?: number): Promise<StorageInfo>;
}
//# sourceMappingURL=cloudron-client.d.ts.map