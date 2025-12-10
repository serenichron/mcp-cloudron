/**
 * Cloudron MCP Server Error Handling
 * Custom error classes and MCP error mapping utilities
 */
/**
 * Base error class for all Cloudron-related errors
 */
export declare class CloudronError extends Error {
    statusCode: number;
    context?: Record<string, unknown> | undefined;
    /**
     * Creates a CloudronError
     * @param message - Error description
     * @param statusCode - HTTP status code (if applicable)
     * @param context - Additional error context for debugging
     */
    constructor(message: string, statusCode?: number, context?: Record<string, unknown> | undefined);
    /**
     * Convert error to JSON for logging
     */
    toJSON(): {
        name: string;
        message: string;
        statusCode: number;
        context: Record<string, unknown> | undefined;
    };
}
/**
 * Error for authentication failures (401)
 */
export declare class CloudronAuthError extends CloudronError {
    constructor(message?: string, context?: Record<string, unknown>);
}
/**
 * Error for permission denied (403)
 */
export declare class CloudronPermissionError extends CloudronError {
    constructor(message?: string, context?: Record<string, unknown>);
}
/**
 * Error for resource not found (404)
 */
export declare class CloudronNotFoundError extends CloudronError {
    constructor(message?: string, context?: Record<string, unknown>);
}
/**
 * Error for API errors and other issues
 */
export declare class CloudronAPIError extends CloudronError {
    constructor(message?: string, statusCode?: number, context?: Record<string, unknown>);
}
/**
 * Error for rate limiting (429)
 */
export declare class CloudronRateLimitError extends CloudronError {
    retryAfter?: number | undefined;
    constructor(message?: string, retryAfter?: number | undefined, context?: Record<string, unknown>);
}
/**
 * Error for configuration issues
 */
export declare class CloudronConfigError extends CloudronError {
    constructor(message?: string, context?: Record<string, unknown>);
}
/**
 * Maps Cloudron error responses to appropriate error classes
 * @param statusCode - HTTP status code from Cloudron API
 * @param message - Error message from Cloudron API or network error
 * @param data - Full response data (if available)
 * @returns Appropriate CloudronError subclass instance
 */
export declare function createCloudronError(statusCode: number, message: string, data?: Record<string, unknown>): CloudronError;
/**
 * Converts CloudronError to MCP-compatible error response
 * Ensures no sensitive information (tokens, internal paths) leaks
 * @param error - The error to convert
 * @returns Safe error message for MCP response
 */
export declare function toMCPErrorMessage(error: unknown): string;
//# sourceMappingURL=errors.d.ts.map