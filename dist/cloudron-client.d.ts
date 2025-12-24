/**
 * Cloudron API Client
 * MVP scope: listApps + getApp endpoints
 * DI-enabled for testing
 */
import type { CloudronClientConfig, App, SystemStatus, TaskStatus, StorageInfo, ValidatableOperation, ValidationResult, Backup, AppStoreApp, User } from './types.js';
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
     * List all backups
     * GET /api/v1/backups
     * @returns Array of backups sorted by timestamp (newest first)
     */
    listBackups(): Promise<Backup[]>;
    /**
     * List all users on Cloudron instance
     * GET /api/v1/users
     * @returns Array of users sorted by role then email
     */
    listUsers(): Promise<User[]>;
    /**
     * Search Cloudron App Store for available applications
     * GET /api/v1/appstore?search={query}
     * @param query - Optional search query (empty returns all apps)
     * @returns Array of app store apps sorted by relevance score
     */
    searchApps(query?: string): Promise<AppStoreApp[]>;
    /**
     * Start an app
     * POST /api/v1/apps/:appId/start
     * @returns 202 Accepted response with task ID
     */
    startApp(appId: string): Promise<{
        taskId: string;
    }>;
    /**
     * Stop an app
     * POST /api/v1/apps/:appId/stop
     * @returns 202 Accepted response with task ID
     */
    stopApp(appId: string): Promise<{
        taskId: string;
    }>;
    /**
     * Restart an app
     * POST /api/v1/apps/:appId/restart
     * @returns 202 Accepted response with task ID
     */
    restartApp(appId: string): Promise<{
        taskId: string;
    }>;
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
    /**
     * Validate a destructive operation before execution (pre-flight safety check)
     * @param operation - Type of operation to validate
     * @param resourceId - ID of the resource being operated on
     * @returns Validation result with errors, warnings, and recommendations
     */
    validateOperation(operation: ValidatableOperation, resourceId: string): Promise<ValidationResult>;
    /**
     * Validate uninstall_app operation
     * Checks: app exists, no dependent apps, backup exists
     */
    private validateUninstallApp;
    /**
     * Validate delete_user operation
     * Checks: user exists, not last admin, not currently logged in
     */
    private validateDeleteUser;
    /**
     * Validate restore_backup operation
     * Checks: backup exists, backup integrity valid, sufficient storage
     */
    private validateRestoreBackup;
}
//# sourceMappingURL=cloudron-client.d.ts.map