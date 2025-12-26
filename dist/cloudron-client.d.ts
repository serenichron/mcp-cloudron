/**
 * Cloudron API Client
 * MVP scope: listApps + getApp endpoints
 * DI-enabled for testing
 */
import type { CloudronClientConfig, App, SystemStatus, TaskStatus, StorageInfo, ValidatableOperation, ValidationResult, Backup, AppStoreApp, User, LogType, LogEntry, AppConfig, ConfigureAppResponse, ManifestValidationResult, InstallAppParams } from './types.js';
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
     * Create a new backup (with F36 pre-flight storage check)
     * POST /api/v1/backups
     * @returns Task ID for tracking backup progress via getTaskStatus()
     */
    createBackup(): Promise<string>;
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
     * Create a new user with role assignment (atomic operation)
     * POST /api/v1/users
     * @param email - User email address
     * @param password - User password (must meet strength requirements)
     * @param role - User role: 'admin', 'user', or 'guest'
     * @returns Created user object
     */
    createUser(email: string, password: string, role: 'admin' | 'user' | 'guest'): Promise<User>;
    /**
     * Validate email format using RFC 5322 simplified regex
     * @param email - Email to validate
     * @returns true if email format is valid
     */
    private isValidEmail;
    /**
     * Validate password strength
     * Requirements: 8+ characters, 1 uppercase letter, 1 number
     * @param password - Password to validate
     * @returns true if password meets strength requirements
     */
    private isValidPassword;
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
     * Configure app settings (env vars, memory limits, access control)
     * PUT /api/v1/apps/:appId/configure
     * @param appId - The app ID to configure
     * @param config - Configuration object with env vars, memoryLimit, accessRestriction
     * @returns Response with updated app and restart requirement flag
     */
    configureApp(appId: string, config: AppConfig): Promise<ConfigureAppResponse>;
    /**
     * Uninstall an application (DESTRUCTIVE OPERATION)
     * POST /api/v1/apps/:id/uninstall
     * Returns task ID for async operation tracking
     * Performs pre-flight validation via F37 before proceeding
     */
    uninstallApp(appId: string): Promise<{
        taskId: string;
    }>;
    /**
     * Get task status for async operations
     * GET /api/v1/tasks/:taskId
     */
    getTaskStatus(taskId: string): Promise<TaskStatus>;
    /**
     * Cancel a running async operation (kill switch)
     * DELETE /api/v1/tasks/:taskId
     * @returns Updated task status with 'cancelled' state
     */
    cancelTask(taskId: string): Promise<TaskStatus>;
    /**
     * Get logs for an app or service
     * GET /api/v1/apps/:id/logs or GET /api/v1/services/:id/logs
     * @param resourceId - App ID or service ID
     * @param type - Type of resource ('app' or 'service')
     * @param lines - Optional number of log lines to retrieve (default 100, max 1000)
     * @returns Formatted log entries with timestamps and severity levels
     */
    getLogs(resourceId: string, type: LogType, lines?: number): Promise<LogEntry[]>;
    /**
     * Parse raw log lines into structured LogEntry objects
     * Attempts to extract timestamp and severity level from log lines
     */
    private parseLogEntries;
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
    /**
     * Validate app manifest before installation (F23a pre-flight safety check)
     * Checks: F36 storage sufficient, dependencies available, configuration schema valid
     * @param appId - The app ID to validate from App Store
     * @param requiredMB - Optional disk space requirement in MB (defaults to 500MB)
     * @returns Validation result with errors and warnings
     */
    validateManifest(appId: string, requiredMB?: number): Promise<ManifestValidationResult>;
    /**
     * Install an application from the App Store (F23b with pre-flight validation)
     * POST /api/v1/apps/install
     * @param params - Installation parameters (manifestId, location, optional config)
     * @returns Task ID for tracking installation progress via getTaskStatus()
     */
    installApp(params: InstallAppParams): Promise<string>;
}
//# sourceMappingURL=cloudron-client.d.ts.map