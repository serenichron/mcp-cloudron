/**
 * Cloudron Error Classes
 * MVP scope: Base error + Auth error only
 */
/** Base error for all Cloudron API errors */
export declare class CloudronError extends Error {
    readonly statusCode: number | undefined;
    readonly code: string | undefined;
    constructor(message: string, statusCode?: number, code?: string);
    /**
     * Check if error is retryable (for future Phase 3)
     * 429 (rate limit) and 5xx errors are retryable
     * 4xx errors (except 429) are NOT retryable
     */
    isRetryable(): boolean;
}
/** Authentication/Authorization error (401/403) */
export declare class CloudronAuthError extends CloudronError {
    constructor(message?: string, statusCode?: number);
}
/**
 * Type guard for CloudronError
 * Usage: if (isCloudronError(error)) { ... }
 */
export declare function isCloudronError(error: unknown): error is CloudronError;
/**
 * Create appropriate error from HTTP status code
 * Routes 401/403 to CloudronAuthError, others to CloudronError
 */
export declare function createErrorFromStatus(statusCode: number, message: string): CloudronError;
//# sourceMappingURL=errors.d.ts.map