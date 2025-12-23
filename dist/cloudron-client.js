/**
 * Cloudron API Client
 * MVP scope: listApps + getApp endpoints
 * DI-enabled for testing
 */
import { CloudronError, CloudronAuthError, createErrorFromStatus } from './errors.js';
const DEFAULT_TIMEOUT = 30000;
export class CloudronClient {
    baseUrl;
    token;
    /**
     * Create CloudronClient with DI support
     * @param config - Optional config (defaults to env vars)
     */
    constructor(config) {
        const baseUrl = config?.baseUrl ?? process.env.CLOUDRON_BASE_URL;
        const token = config?.token ?? process.env.CLOUDRON_API_TOKEN;
        if (!baseUrl) {
            throw new CloudronError('CLOUDRON_BASE_URL not set. Provide via config or environment variable.');
        }
        if (!token) {
            throw new CloudronError('CLOUDRON_API_TOKEN not set. Provide via config or environment variable.');
        }
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.token = token;
    }
    /**
     * Make HTTP request to Cloudron API
     * NO retry logic (deferred to Phase 3 with idempotency keys)
     */
    async makeRequest(method, endpoint, body, options) {
        const url = `${this.baseUrl}${endpoint}`;
        const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const fetchOptions = {
                method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            };
            if (body !== undefined) {
                fetchOptions.body = JSON.stringify(body);
            }
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorBody = await response.text();
                let message = `Cloudron API error: ${response.status} ${response.statusText}`;
                try {
                    const parsed = JSON.parse(errorBody);
                    if (parsed.message)
                        message = parsed.message;
                }
                catch {
                    // Use default message if body isn't JSON
                }
                throw createErrorFromStatus(response.status, message);
            }
            return await response.json();
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof CloudronError) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new CloudronError(`Request timeout after ${timeout}ms`, undefined, 'TIMEOUT');
                }
                throw new CloudronError(`Network error: ${error.message}`, undefined, 'NETWORK_ERROR');
            }
            throw new CloudronError('Unknown error occurred');
        }
    }
    // ==================== MVP Endpoints ====================
    /**
     * List all installed apps
     * GET /api/v1/apps
     */
    async listApps() {
        const response = await this.makeRequest('GET', '/api/v1/apps');
        return response.apps;
    }
    /**
     * Get a specific app by ID
     * GET /api/v1/apps/:appId
     *
     * Note: API returns app object directly, not wrapped in { app: {...} }
     */
    async getApp(appId) {
        if (!appId) {
            throw new CloudronError('appId is required');
        }
        return await this.makeRequest('GET', `/api/v1/apps/${encodeURIComponent(appId)}`);
    }
    /**
     * Get Cloudron system status
     * GET /api/v1/cloudron/status
     */
    async getStatus() {
        return await this.makeRequest('GET', '/api/v1/cloudron/status');
    }
    /**
     * Get task status for async operations
     * GET /api/v1/tasks/:taskId
     */
    async getTaskStatus(taskId) {
        if (!taskId) {
            throw new CloudronError('taskId is required');
        }
        return await this.makeRequest('GET', `/api/v1/tasks/${encodeURIComponent(taskId)}`);
    }
    /**
     * Check available disk space for pre-flight validation
     * GET /api/v1/cloudron/status (reuses existing endpoint)
     * @param requiredMB - Optional required disk space in MB
     * @returns Storage info with availability and threshold checks
     */
    async checkStorage(requiredMB) {
        const status = await this.getStatus();
        if (!status.disk) {
            throw new CloudronError('Disk information not available in system status');
        }
        // Convert bytes to MB
        const available_mb = Math.floor(status.disk.free / 1024 / 1024);
        const total_mb = Math.floor(status.disk.total / 1024 / 1024);
        const used_mb = Math.floor(status.disk.used / 1024 / 1024);
        // Check if sufficient space available (if requiredMB provided)
        const sufficient = requiredMB !== undefined ? available_mb >= requiredMB : true;
        // Warning threshold: available < 10% of total
        const warning = available_mb < (total_mb * 0.1);
        // Critical threshold: available < 5% of total
        const critical = available_mb < (total_mb * 0.05);
        return {
            available_mb,
            total_mb,
            used_mb,
            sufficient,
            warning,
            critical,
        };
    }
}
//# sourceMappingURL=cloudron-client.js.map