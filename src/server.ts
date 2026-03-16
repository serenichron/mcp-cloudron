#!/usr/bin/env node
/**
 * Cloudron MCP Server
 * Provides tools for managing Cloudron instances via MCP protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { CloudronClient } from './cloudron-client.js';
import { isCloudronError } from './errors.js';
import type { App, SystemStatus, TaskStatus, StorageInfo, ValidatableOperation, ValidationResult, Backup, User, LogType, LogEntry, ManifestValidationResult } from './types.js';

// Tool definitions
const TOOLS = [
  {
    name: 'cloudron_list_apps',
    description: 'List all installed applications on the Cloudron instance. Returns app details including name, domain, status, and health.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_get_app',
    description: 'Get detailed information about a specific application by its ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_get_status',
    description: 'Get the current status and configuration of the Cloudron instance.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_task_status',
    description: 'Get the status of an async operation (backup, install, restore, etc.) by task ID. Returns state (pending/running/success/error/cancelled), progress (0-100%), and message.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: {
          type: 'string',
          description: 'The unique identifier of the task to check',
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'cloudron_cancel_task',
    description: 'Cancel a running async operation (kill switch). Returns updated task status with state "cancelled". Already completed tasks cannot be cancelled. Cancelled tasks cleanup resources (e.g., partial backups deleted).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: {
          type: 'string',
          description: 'The unique identifier of the task to cancel',
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'cloudron_check_storage',
    description: 'Check available disk space before operations that create data (backup, install). Returns available/total/used disk space in MB, plus warning and critical threshold alerts.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        requiredMB: {
          type: 'number',
          description: 'Optional: Required disk space in MB. If provided, checks if available >= requiredMB',
        },
      },
      required: [],
    },
  },
  {
    name: 'cloudron_validate_operation',
    description: 'Pre-flight validation for destructive operations (uninstall app, delete user, restore backup). Returns validation result with blocking errors, warnings, and recommendations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        operation: {
          type: 'string',
          enum: ['uninstall_app', 'delete_user', 'restore_backup'],
          description: 'Type of destructive operation to validate',
        },
        resourceId: {
          type: 'string',
          description: 'ID of the resource being operated on (appId, userId, or backupId)',
        },
      },
      required: ['operation', 'resourceId'],
    },
  },
  {
    name: 'cloudron_control_app',
    description: 'Control app lifecycle (start, stop, restart). Returns 202 Accepted with task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to control',
        },
        action: {
          type: 'string',
          enum: ['start', 'stop', 'restart'],
          description: 'Action to perform on the app',
        },
      },
      required: ['appId', 'action'],
    },
  },
  {
    name: 'cloudron_configure_app',
    description: 'Update application configuration including environment variables, memory limits, and access control settings. Returns 200 OK with updated app config and restart requirement flag.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to configure',
        },
        config: {
          type: 'object',
          description: 'Configuration object with env vars, memoryLimit, and/or accessRestriction',
          properties: {
            env: {
              type: 'object',
              description: 'Environment variables as key-value pairs (optional)',
              additionalProperties: { type: 'string' },
            },
            memoryLimit: {
              type: 'number',
              description: 'Memory limit in MB (optional)',
            },
            accessRestriction: {
              type: ['string', 'null'],
              description: 'Access control settings (optional)',
            },
          },
        },
      },
      required: ['appId', 'config'],
    },
  },
  {
    name: 'cloudron_list_backups',
    description: 'List all backups available on the Cloudron instance. Returns backup details including ID, timestamp, size, app count, and status. Backups are sorted by timestamp (newest first).',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_create_backup',
    description: 'Create a new backup of the Cloudron instance. Performs F36 pre-flight storage check (requires 5GB minimum). Returns task ID for tracking backup progress via cloudron_task_status (F34).',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_list_users',
    description: 'List all users on the Cloudron instance. Returns user details including ID, email, username, role, and creation date. Users are sorted by role (admin, user, guest) then email.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_search_apps',
    description: 'Search the Cloudron App Store for available applications. Returns app details including name, description, version, icon URL, and install count. Results are sorted by relevance score. Empty query returns all available apps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query to filter apps (optional - empty returns all apps)',
        },
      },
      required: [],
    },
  },
  {
    name: 'cloudron_validate_manifest',
    description: 'Validate app manifest before installation (pre-flight safety check). Checks storage sufficiency via F36, dependency availability, and manifest schema validity. Returns validation report with errors and warnings.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The App Store ID to validate',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_create_user',
    description: 'Create a new user on the Cloudron instance with email, password, and role in a single atomic operation. Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 number. Returns 201 Created with user object.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        email: {
          type: 'string',
          description: 'User email address (must be valid format)',
        },
        password: {
          type: 'string',
          description: 'User password (minimum 8 characters, must contain at least 1 uppercase letter and 1 number)',
        },
        role: {
          type: 'string',
          enum: ['admin', 'user', 'guest'],
          description: 'User role: admin (full access), user (standard access), or guest (limited access). Default: user',
        },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: 'cloudron_get_user',
    description: 'Get detailed information about a specific user by user ID. Returns user object with email, username, display name, role, groups, and timestamps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to retrieve',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'cloudron_update_user',
    description: 'Update an existing user\'s properties including email, display name, password, role, or group membership. All fields are optional - only provided fields will be updated.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to update',
        },
        email: {
          type: 'string',
          description: 'New email address (optional)',
        },
        displayName: {
          type: 'string',
          description: 'New display name (optional)',
        },
        password: {
          type: 'string',
          description: 'New password (minimum 8 characters, optional)',
        },
        role: {
          type: 'string',
          enum: ['admin', 'user', 'guest'],
          description: 'New role (optional)',
        },
        groups: {
          type: 'array',
          items: { type: 'string' },
          description: 'New groups array (optional)',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'cloudron_delete_user',
    description: 'Delete a user from the Cloudron instance. WARNING: This is a destructive operation. Use cloudron_validate_operation before deletion to check for potential issues (last admin, owned apps). Requires confirmation flag set to true.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to delete',
        },
        confirm: {
          type: 'boolean',
          description: 'Confirmation flag - must be set to true to proceed with deletion',
        },
      },
      required: ['userId', 'confirm'],
    },
  },
  {
    name: 'cloudron_list_domains',
    description: 'List all configured domains on the Cloudron instance. Returns domain details including name, provider, verification status, and TLS configuration.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'cloudron_get_logs',
    description: 'Get logs for an app or service. Logs are formatted with timestamps and severity levels for readability. Type parameter determines endpoint: "app" calls GET /api/v1/apps/:id/logs, "service" calls GET /api/v1/services/:id/logs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceId: {
          type: 'string',
          description: 'App ID or service ID to retrieve logs for',
        },
        type: {
          type: 'string',
          enum: ['app', 'service'],
          description: 'Type of resource: "app" for application logs, "service" for system service logs',
        },
        lines: {
          type: 'number',
          description: 'Optional: Number of log lines to retrieve (default 100, max 1000)',
        },
      },
      required: ['resourceId', 'type'],
    },
  },
  {
    name: 'cloudron_uninstall_app',
    description: 'Uninstall an application with pre-flight safety validation. DESTRUCTIVE OPERATION. First validates via cloudron_validate_operation (checks app exists, no dependencies, backup recommended), then calls DELETE /api/v1/apps/:id. Returns 202 Accepted with task ID for async operation tracking.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to uninstall',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_install_app',
    description: 'Install application from Cloudron App Store with pre-flight validation. Calls F23a (cloudron_validate_manifest) to verify app exists and F36 (cloudron_check_storage) to ensure sufficient disk space. Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        manifestId: {
          type: 'string',
          description: 'App manifest ID from App Store',
        },
        location: {
          type: 'string',
          description: 'Subdomain for app installation',
        },
        domain: {
          type: 'string',
          description: 'Domain where app will be installed (REQUIRED)',
        },
        portBindings: {
          type: 'object',
          description: 'Optional port bindings',
        },
        accessRestriction: {
          type: ['string', 'null'],
          description: 'Access control setting (can be null for no restriction)',
        },
        env: {
          type: 'object',
          description: 'Environment variables',
        },
      },
      required: ['manifestId', 'location', 'domain', 'accessRestriction'],
    },
  },
  {
    name: 'cloudron_check_updates',
    description: 'Check if Cloudron platform updates are available. Returns update information including availability, version, and changelog if an update exists.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_apply_update',
    description: 'Apply available Cloudron platform update. DESTRUCTIVE OPERATION - services will restart during update. Performs pre-flight validation to check update is available and recommends backup. Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_list_groups',
    description: 'List all groups on the Cloudron instance. Returns group details including ID, name, and creation date. Groups are sorted alphabetically by name.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_create_group',
    description: 'Create a new group on the Cloudron instance. Groups can be used for access control and user organization.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'The name of the group to create (required)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'cloudron_list_services',
    description: 'List all platform services (read-only diagnostics). Returns status of Cloudron infrastructure services like databases (MySQL, PostgreSQL, MongoDB), mail, and other platform components. This is diagnostic information - services are managed automatically by Cloudron.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'cloudron_backup_app',
    description: 'Create a backup of a specific application. Performs pre-flight storage check (requires 5GB minimum). Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to backup',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_restore_app',
    description: 'Restore an application from a backup. DESTRUCTIVE OPERATION - current app data will be replaced. Performs pre-flight validation to check backup exists and storage is sufficient. Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to restore',
        },
        backupId: {
          type: 'string',
          description: 'The backup ID to restore from (REQUIRED)',
        },
      },
      required: ['appId', 'backupId'],
    },
  },
  {
    name: 'cloudron_clone_app',
    description: 'Clone an existing application to a new location. Creates a duplicate of the app with its data and configuration. Performs pre-flight validation to check source app exists and target location is available. Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to clone',
        },
        location: {
          type: 'string',
          description: 'Subdomain for the cloned app (REQUIRED)',
        },
        domain: {
          type: 'string',
          description: 'Domain for the cloned app (optional, defaults to same domain as source)',
        },
        backupId: {
          type: 'string',
          description: 'Optional backup ID to clone from a specific backup state',
        },
        portBindings: {
          type: 'object',
          description: 'Optional port bindings for the clone',
        },
      },
      required: ['appId', 'location'],
    },
  },
  {
    name: 'cloudron_repair_app',
    description: 'Repair a broken application. Attempts automatic repair of apps in error state. Use when an app is unhealthy or has installation issues. Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to repair',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_update_app',
    description: 'Update an application to a newer version. Performs pre-flight validation to check app exists and is in installed state. Returns task ID for async operation tracking via cloudron_task_status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: 'The unique identifier of the application to update',
        },
        version: {
          type: 'string',
          description: 'Optional specific version to update to (defaults to latest)',
        },
        force: {
          type: 'boolean',
          description: 'Force update even if already on same version',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_fetch_package_example',
    description: 'Fetch real package examples from git.cloudron.io. Finds the repository for a given App Store ID and returns the content of key files (CloudronManifest.json, Dockerfile, start.sh).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appId: {
          type: 'string',
          description: "The App Store ID to fetch (e.g., 'com.electerious.ackee')",
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'cloudron_packaging_guide',
    description: 'Get interactive, topic-specific guidance for creating Cloudron packages. Provides documentation, best practices, and reference implementation examples for packaging web applications for Cloudron.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: {
          type: 'string',
          enum: ['overview', 'manifest', 'dockerfile', 'addons', 'testing', 'publishing'],
          description: "The packaging topic to get guidance on. 'overview' provides quick start and workflow, 'manifest' covers CloudronManifest.json fields, 'dockerfile' covers Dockerfile best practices, 'addons' covers available platform services, 'testing' covers integration test patterns, 'publishing' covers App Store submission.",
        },
        appType: {
          type: 'string',
          enum: ['nodejs', 'php', 'python', 'java', 'go', 'static'],
          description: "Optional: The type of application being packaged. Provides language/framework-specific guidance when topic is 'dockerfile'.",
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'cloudron_scaffold_package',
    description: 'Generate a complete Cloudron package scaffold with all required files (CloudronManifest.json, Dockerfile, start.sh, test/test.js). Provides ready-to-use templates customized for your application type, addons, and authentication method.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        appName: {
          type: 'string',
          description: 'Name of the application (used in manifest title and generated files).',
        },
        appType: {
          type: 'string',
          enum: ['nodejs', 'php', 'python', 'java', 'go', 'static'],
          description: 'The type of application being packaged. Determines the Dockerfile template and startup script.',
        },
        appId: {
          type: 'string',
          description: "Optional: Reverse domain identifier (e.g., 'com.example.myapp'). Auto-generated from appName if not provided.",
        },
        description: {
          type: 'string',
          description: 'Optional: Application description for the manifest.',
        },
        version: {
          type: 'string',
          description: "Optional: Initial version in semver format (default: '1.0.0').",
        },
        httpPort: {
          type: 'number',
          description: 'Optional: HTTP port the application listens on (default: 8000).',
        },
        addons: {
          type: 'array',
          items: { type: 'string', enum: ['localstorage', 'mysql', 'postgresql', 'mongodb', 'redis', 'ldap', 'oidc', 'sendmail', 'recvmail', 'scheduler'] },
          description: "Optional: Required Cloudron addons (default: ['localstorage']).",
        },
        authMethod: {
          type: 'string',
          enum: ['ldap', 'oidc', 'proxyAuth', 'none'],
          description: "Optional: Authentication method to configure (default: 'none').",
        },
        healthCheckPath: {
          type: 'string',
          description: "Optional: Path for health checks (default: '/').",
        },
        website: {
          type: 'string',
          description: 'Optional: Application website URL.',
        },
        memoryLimit: {
          type: 'number',
          description: 'Optional: Memory limit in bytes (default: 256MB = 268435456).',
        },
      },
      required: ['appName', 'appType'],
    },
  },
  {
    name: 'cloudron_validate_package',
    description: 'Validate Cloudron package files (CloudronManifest.json, Dockerfile, start.sh) for errors and best practices. Returns detailed validation report with errors, warnings, and suggestions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        manifest: {
          type: 'string',
          description: 'Optional: Content of CloudronManifest.json file to validate.',
        },
        dockerfile: {
          type: 'string',
          description: 'Optional: Content of Dockerfile to validate.',
        },
        startScript: {
          type: 'string',
          description: 'Optional: Content of start.sh script to validate.',
        },
      },
      required: [],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'cloudron-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Lazy-initialize client (validates env vars on first use)
let client: CloudronClient | null = null;

function getClient(): CloudronClient {
  if (!client) {
    client = new CloudronClient();
  }
  return client;
}

// Format app for display
function formatApp(app: App): string {
  const fqdn = app.location ? `${app.location}.${app.domain}` : app.domain;
  return `${app.manifest.title} (${fqdn})
  ID: ${app.id}
  State: ${app.installationState}
  Health: ${app.health ?? 'unknown'}
  Memory: ${Math.round(app.memoryLimit / 1024 / 1024)} MB`;
}

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const cloudron = getClient();

    switch (name) {
      case 'cloudron_list_apps': {
        const apps = await cloudron.listApps();
        const formatted = apps.map(formatApp).join('\n\n');
        return {
          content: [
            {
              type: 'text' as const,
              text: `Found ${apps.length} apps:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'cloudron_get_app': {
        const appId = (args as { appId: string }).appId;
        const app = await cloudron.getApp(appId);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatApp(app),
            },
          ],
        };
      }

      case 'cloudron_get_status': {
        const status = await cloudron.getStatus();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Cloudron Status:
  Name: ${status.cloudronName}
  Version: ${status.version}
  Admin URL: ${status.adminFqdn}
  Provider: ${status.provider}
  Demo Mode: ${status.isDemo}`,
            },
          ],
        };
      }

      case 'cloudron_task_status': {
        const taskId = (args as { taskId: string }).taskId;
        const taskStatus = await cloudron.getTaskStatus(taskId);

        let statusText = `Task Status:
  ID: ${taskStatus.id}
  State: ${taskStatus.state}
  Progress: ${taskStatus.progress}%
  Message: ${taskStatus.message}`;

        if (taskStatus.state === 'success' && taskStatus.result) {
          statusText += `\n  Result: ${JSON.stringify(taskStatus.result, null, 2)}`;
        }

        if (taskStatus.state === 'error' && taskStatus.error) {
          statusText += `\n  Error: ${taskStatus.error.message}`;
          if (taskStatus.error.code) {
            statusText += `\n  Error Code: ${taskStatus.error.code}`;
          }
        }

        if (taskStatus.state === 'cancelled') {
          statusText += '\n  ℹ️  Task was cancelled by user request';
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: statusText,
            },
          ],
        };
      }

      case 'cloudron_cancel_task': {
        const taskId = (args as { taskId: string }).taskId;
        const taskStatus = await cloudron.cancelTask(taskId);

        let statusText = `Task Cancellation:
  Task ID: ${taskStatus.id}
  New State: ${taskStatus.state}
  Message: ${taskStatus.message}`;

        if (taskStatus.state === 'cancelled') {
          statusText += '\n\n✅ Task successfully cancelled. Resources have been cleaned up.';
        } else {
          statusText += `\n\n⚠️  Task is in state '${taskStatus.state}' (expected 'cancelled'). Cancellation may not have completed.`;
        }

        statusText += `\n\nUse cloudron_task_status with taskId '${taskId}' to verify final state.`;

        return {
          content: [
            {
              type: 'text' as const,
              text: statusText,
            },
          ],
        };
      }

      case 'cloudron_check_storage': {
        const requiredMB = (args as { requiredMB?: number }).requiredMB;
        const storageInfo = await cloudron.checkStorage(requiredMB);

        let statusText = `Storage Status:
  Available: ${storageInfo.available_mb} MB
  Total: ${storageInfo.total_mb} MB
  Used: ${storageInfo.used_mb} MB`;

        if (requiredMB !== undefined) {
          statusText += `\n  Required: ${requiredMB} MB`;
          statusText += `\n  Sufficient: ${storageInfo.sufficient ? 'Yes' : 'No'}`;
        }

        if (storageInfo.critical) {
          statusText += '\n  ⚠️  CRITICAL: Less than 5% disk space remaining!';
        } else if (storageInfo.warning) {
          statusText += '\n  ⚠️  WARNING: Less than 10% disk space remaining';
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: statusText,
            },
          ],
        };
      }

      case 'cloudron_validate_operation': {
        const { operation, resourceId } = args as { operation: ValidatableOperation; resourceId: string };
        const validationResult = await cloudron.validateOperation(operation, resourceId);

        let statusText = `Validation Result for ${operation} on resource '${resourceId}':
  Valid: ${validationResult.valid ? 'Yes' : 'No'}`;

        if (validationResult.errors.length > 0) {
          statusText += '\n\nBlocking Errors:';
          validationResult.errors.forEach((error, i) => {
            statusText += `\n  ${i + 1}. ${error}`;
          });
        }

        if (validationResult.warnings.length > 0) {
          statusText += '\n\nWarnings:';
          validationResult.warnings.forEach((warning, i) => {
            statusText += `\n  ${i + 1}. ${warning}`;
          });
        }

        if (validationResult.recommendations.length > 0) {
          statusText += '\n\nRecommendations:';
          validationResult.recommendations.forEach((rec, i) => {
            statusText += `\n  ${i + 1}. ${rec}`;
          });
        }

        if (validationResult.valid) {
          statusText += '\n\n✅ Operation can proceed (warnings should be reviewed)';
        } else {
          statusText += '\n\n❌ Operation blocked due to errors listed above';
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: statusText,
            },
          ],
        };
      }

      case 'cloudron_control_app': {
        const { appId, action } = args as { appId: string; action: 'start' | 'stop' | 'restart' };

        // Validate action enum
        if (!['start', 'stop', 'restart'].includes(action)) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Invalid action: ${action}. Valid options: start, stop, restart`,
              },
            ],
            isError: true,
          };
        }

        // Execute action
        let result: { taskId: string };
        switch (action) {
          case 'start':
            result = await cloudron.startApp(appId);
            break;
          case 'stop':
            result = await cloudron.stopApp(appId);
            break;
          case 'restart':
            result = await cloudron.restartApp(appId);
            break;
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `App ${action} initiated successfully.
  App ID: ${appId}
  Task ID: ${result.taskId}

Use cloudron_task_status with taskId '${result.taskId}' to track completion.`,
            },
          ],
        };
      }

      case 'cloudron_configure_app': {
        const { appId, config } = args as { appId: string; config: Record<string, unknown> };

        // Validate config object is provided and not empty
        if (!config || Object.keys(config).length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Config object is required and cannot be empty. Provide at least one of: env, memoryLimit, accessRestriction',
              },
            ],
            isError: true,
          };
        }

        const result = await cloudron.configureApp(appId, config);

        // Format config changes summary
        const configChanges = Object.keys(config).map(key => {
          if (key === 'env') {
            const envCount = Object.keys(config.env as object).length;
            return `  - Environment variables: ${envCount} variable(s) updated`;
          } else if (key === 'memoryLimit') {
            return `  - Memory limit: ${config.memoryLimit} MB`;
          } else if (key === 'accessRestriction') {
            return `  - Access restriction: ${config.accessRestriction ?? 'none'}`;
          } else {
            return `  - ${key}: updated`;
          }
        }).join('\n');

        const restartNote = result.restartRequired
          ? '\n⚠️  App restart required for configuration changes to take effect. Use cloudron_control_app with action "restart".'
          : '\n✓ Configuration applied. No restart required.';

        return {
          content: [
            {
              type: 'text' as const,
              text: `App configuration updated successfully.
App ID: ${appId}

Configuration changes:
${configChanges}
${restartNote}`,
            },
          ],
        };
      }

      case 'cloudron_list_backups': {
        const backups = await cloudron.listBackups();

        if (backups.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No backups found.',
              },
            ],
          };
        }

        const formatted = backups.map((backup, i) => {
          const timestamp = new Date(backup.creationTime).toLocaleString();
          const size = backup.size ? `${Math.round(backup.size / 1024 / 1024)} MB` : 'N/A';
          const appCount = backup.appCount !== undefined ? backup.appCount : 'N/A';

          return `${i + 1}. Backup ${backup.id}
  Timestamp: ${timestamp}
  Version: ${backup.version}
  Type: ${backup.type}
  State: ${backup.state}
  Size: ${size}
  App Count: ${appCount}${backup.errorMessage ? `\n  Error: ${backup.errorMessage}` : ''}`;
        }).join('\n\n');

        return {
          content: [
            {
              type: 'text' as const,
              text: `Found ${backups.length} backup(s):\n\n${formatted}`,
            },
          ],
        };
      }

      case 'cloudron_create_backup': {
        // F36 pre-flight storage check performed in createBackup()
        const taskId = await cloudron.createBackup();

        return {
          content: [
            {
              type: 'text' as const,
              text: `Backup creation started successfully.

Task ID: ${taskId}

Use cloudron_task_status with taskId="${taskId}" to track backup progress.

Note: Pre-flight storage check passed (5GB minimum required).`,
            },
          ],
        };
      }

      case 'cloudron_list_users': {
        const users = await cloudron.listUsers();

        if (users.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No users found.',
              },
            ],
          };
        }

        const formatted = users.map((user, i) => {
          const createdAt = new Date(user.createdAt).toLocaleString();

          return `${i + 1}. ${user.username} (${user.email})
  ID: ${user.id}
  Role: ${user.role}
  Created: ${createdAt}`;
        }).join('\n\n');

        return {
          content: [
            {
              type: 'text' as const,
              text: `Found ${users.length} user(s):\n\n${formatted}`,
            },
          ],
        };
      }

      case 'cloudron_search_apps': {
        const { query } = args as { query?: string };
        const apps = await cloudron.searchApps(query);

        if (apps.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: query
                  ? `No apps found matching query: "${query}"`
                  : 'No apps available in the App Store.',
              },
            ],
          };
        }

        const formatted = apps.map((app, i) => {
          const installCount = app.installCount !== undefined ? app.installCount : 'N/A';
          const iconUrl = app.iconUrl || 'N/A';
          const score = app.relevanceScore !== undefined ? app.relevanceScore.toFixed(2) : 'N/A';

          return `${i + 1}. ${app.name} (${app.id})
  Version: ${app.version}
  Description: ${app.description}
  Install Count: ${installCount}
  Icon URL: ${iconUrl}
  Relevance Score: ${score}`;
        }).join('\n\n');

        const searchInfo = query ? `Search results for "${query}"` : 'All available apps';

        return {
          content: [
            {
              type: 'text' as const,
              text: `${searchInfo}:\n\nFound ${apps.length} app(s):\n\n${formatted}`,
            },
          ],
        };
      }

      case 'cloudron_validate_manifest': {
        const { appId } = args as { appId: string };
        const result = await cloudron.validateManifest(appId);

        if (result.valid) {
          const warningText = result.warnings.length > 0
            ? `\n\nWarnings:\n${result.warnings.map(w => `  - ${w}`).join('\n')}`
            : '';

          return {
            content: [
              {
                type: 'text' as const,
                text: `Manifest validation passed for app: ${appId}

App is ready for installation.${warningText}`,
              },
            ],
          };
        } else {
          const errorsText = result.errors.map(e => `  - ${e}`).join('\n');
          const warningsText = result.warnings.length > 0
            ? `\n\nWarnings:\n${result.warnings.map(w => `  - ${w}`).join('\n')}`
            : '';

          return {
            content: [
              {
                type: 'text' as const,
                text: `Manifest validation failed for app: ${appId}

Errors (must be resolved):
${errorsText}${warningsText}`,
              },
            ],
          };
        }
      }

      case 'cloudron_create_user': {
        const { email, password, role = 'user' } = args as {
          email: string;
          password: string;
          role?: 'admin' | 'user' | 'guest';
        };
        const user = await cloudron.createUser(email, password, role);

        return {
          content: [
            {
              type: 'text' as const,
              text: `User created successfully:
  ID: ${user.id}
  Email: ${user.email}
  Username: ${user.username}
  Display Name: ${user.displayName || 'N/A'}
  Role: ${user.role}
  Groups: ${user.groups?.length ? user.groups.join(', ') : 'None'}
  Created: ${new Date(user.createdAt).toLocaleString()}`,
            },
          ],
        };
      }

      case 'cloudron_get_user': {
        const { userId } = args as { userId: string };
        const user = await cloudron.getUser(userId);

        return {
          content: [
            {
              type: 'text' as const,
              text: `User details:
  ID: ${user.id}
  Email: ${user.email}
  Username: ${user.username}
  Display Name: ${user.displayName || 'N/A'}
  Role: ${user.role}
  Groups: ${user.groups?.length ? user.groups.join(', ') : 'None'}
  Created: ${new Date(user.createdAt).toLocaleString()}`,
            },
          ],
        };
      }

      case 'cloudron_update_user': {
        const { userId, email, displayName, password, role, groups } = args as {
          userId: string;
          email?: string;
          displayName?: string;
          password?: string;
          role?: 'admin' | 'user' | 'guest';
          groups?: string[];
        };
        const updates: any = {};
        if (email) updates.email = email;
        if (displayName) updates.displayName = displayName;
        if (password) updates.password = password;
        if (role) updates.role = role;
        if (groups) updates.groups = groups;

        const user = await cloudron.updateUser(userId, updates);

        const updatedFields = Object.keys(updates).filter(k => k !== 'password').join(', ');
        
        return {
          content: [
            {
              type: 'text' as const,
              text: `User updated successfully:
  ID: ${user.id}
  Email: ${user.email}
  Username: ${user.username}
  Display Name: ${user.displayName || 'N/A'}
  Role: ${user.role}
  Groups: ${user.groups?.length ? user.groups.join(', ') : 'None'}
  Updated fields: ${updatedFields || 'password'}`,
            },
          ],
        };
      }

      case 'cloudron_delete_user': {
        const { userId, confirm } = args as { userId: string; confirm: boolean };
        
        if (!confirm) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Error: Confirmation required for user deletion. Set confirm: true to proceed.',
              },
            ],
            isError: true,
          };
        }

        await cloudron.deleteUser(userId);

        return {
          content: [
            {
              type: 'text' as const,
              text: `User ${userId} deleted successfully.`,
            },
          ],
        };
      }

      case 'cloudron_list_domains': {
        const domains = await cloudron.listDomains();

        const domainList = domains.map(d =>
          `Domain: ${d.domain}
  Zone: ${d.zoneName}
  Provider: ${d.provider}
  TLS: ${d.tlsConfig.provider} (wildcard: ${d.tlsConfig.wildcard})`
        ).join('\n\n');

        return {
          content: [
            {
              type: 'text' as const,
              text: `Configured domains (${domains.length}):\n\n${domainList}`,
            },
          ],
        };
      }

      case 'cloudron_get_logs': {
        const { resourceId, type, lines } = args as { resourceId: string; type: LogType; lines?: number };
        const logEntries = await cloudron.getLogs(resourceId, type, lines);

        // Format logs for display
        const formattedLogs = logEntries.map(entry =>
          `[${entry.timestamp}] [${entry.severity}] ${entry.message}`
        ).join('\n');

        const logType = type === 'app' ? 'Application' : 'Service';

        return {
          content: [
            {
              type: 'text' as const,
              text: `${logType} logs for ${resourceId} (${logEntries.length} entries):\n\n${formattedLogs}`,
            },
          ],
        };
      }

      case 'cloudron_uninstall_app': {
        const { appId } = args as { appId: string };
        const result = await cloudron.uninstallApp(appId);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Uninstall operation initiated for app: ${appId}
  Task ID: ${result.taskId}
  Status: Pending (202 Accepted)

Use cloudron_task_status with taskId '${result.taskId}' to track uninstall progress.

Note: This is a DESTRUCTIVE operation. The app and its data will be removed once the task completes.`,
            },
          ],
        };
      }

      case 'cloudron_install_app': {
        const { manifestId, location, domain, portBindings, accessRestriction, env } = args as {
          manifestId: string;
          location: string;
          domain: string;
          portBindings?: Record<string, number>;
          accessRestriction: string | null;
          env?: Record<string, string>;
        };

        const params: any = { manifestId, location, domain, accessRestriction };
        if (portBindings !== undefined) params.portBindings = portBindings;
        if (env !== undefined) params.env = env;

        const taskId = await cloudron.installApp(params);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Installation initiated for app: ${manifestId}
  Location: ${location}
  Task ID: ${taskId}
  Status: Pending (202 Accepted)

Use cloudron_task_status with taskId '${taskId}' to track installation progress.

Note: Pre-flight validation (F23a + F36) passed. Installation is in progress.`,
            },
          ],
        };
      }

      case 'cloudron_check_updates': {
        const updateInfo = await cloudron.checkUpdates();

        if (!updateInfo.available) {
          return {
            content: [{ type: 'text' as const, text: 'Cloudron is up to date. No updates available.' }],
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Cloudron update available!
  Version: ${updateInfo.version ?? 'unknown'}
  Critical: ${updateInfo.critical ? 'Yes' : 'No'}
  Size: ${updateInfo.size ? `${Math.round(updateInfo.size / 1024 / 1024)}MB` : 'unknown'}

${updateInfo.changelog ? `Changelog:\n${updateInfo.changelog}` : ''}

Use cloudron_apply_update to apply this update. Note: services will restart during update.`,
            },
          ],
        };
      }

      case 'cloudron_apply_update': {
        // Pre-flight: check update is available
        const updateAvailable = await cloudron.checkUpdates();
        if (!updateAvailable.available) {
          return {
            content: [{ type: 'text' as const, text: 'No update available. Cloudron is already up to date.' }],
          };
        }

        const taskId = await cloudron.applyUpdate();

        return {
          content: [
            {
              type: 'text' as const,
              text: `Cloudron update initiated!
  Version: ${updateAvailable.version ?? 'latest'}
  Task ID: ${taskId}

Use cloudron_task_status with taskId '${taskId}' to track update progress.

WARNING: Services will restart during the update process. Expect brief downtime.`,
            },
          ],
        };
      }

      case 'cloudron_list_groups': {
        const groups = await cloudron.listGroups();

        if (groups.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No groups found on this Cloudron instance.' }],
          };
        }

        const groupList = groups
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(g => `• ${g.name} (ID: ${g.id})${g.userCount !== undefined ? ` — ${g.userCount} member(s)` : ''}`)
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `Groups (${groups.length}):\n\n${groupList}` }],
        };
      }

      case 'cloudron_create_group': {
        const { name } = args as { name: string };
        const group = await cloudron.createGroup(name);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Group created successfully!
  Name: ${group.name}
  ID: ${group.id}
  Created: ${group.creationTime}`,
            },
          ],
        };
      }

      case 'cloudron_list_services': {
        const services = await cloudron.listServices();

        if (services.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No platform services found.' }],
          };
        }

        const serviceList = services.map(s =>
          `• ${s.name}: ${s.status}${s.version ? ` (v${s.version})` : ''}${s.memory ? ` — ${Math.round(s.memory / 1024 / 1024)}MB` : ''}`
        ).join('\n');

        return {
          content: [{ type: 'text' as const, text: `Platform services (${services.length}):\n\n${serviceList}` }],
        };
      }

      case 'cloudron_backup_app': {
        const { appId } = args as { appId: string };
        const taskId = await cloudron.backupApp(appId);

        return {
          content: [
            {
              type: 'text' as const,
              text: `App backup initiated for: ${appId}
  Task ID: ${taskId}

Use cloudron_task_status with taskId '${taskId}' to track backup progress.

Note: Pre-flight storage check (5GB minimum) passed.`,
            },
          ],
        };
      }

      case 'cloudron_restore_app': {
        const { appId, backupId } = args as { appId: string; backupId: string };
        const taskId = await cloudron.restoreApp(appId, backupId);

        return {
          content: [
            {
              type: 'text' as const,
              text: `App restore initiated!
  App: ${appId}
  Backup: ${backupId}
  Task ID: ${taskId}

Use cloudron_task_status with taskId '${taskId}' to track restore progress.

WARNING: This is a DESTRUCTIVE operation. Current app data is being replaced with the backup.`,
            },
          ],
        };
      }

      case 'cloudron_clone_app': {
        const { appId, location, domain, backupId, portBindings } = args as {
          appId: string;
          location: string;
          domain?: string;
          backupId?: string;
          portBindings?: Record<string, number>;
        };

        const cloneParams: import('./types.js').CloneAppParams = { appId, location };
        if (domain) cloneParams.domain = domain;
        if (backupId) cloneParams.backupId = backupId;
        if (portBindings) cloneParams.portBindings = portBindings;
        const taskId = await cloudron.cloneApp(cloneParams);

        return {
          content: [
            {
              type: 'text' as const,
              text: `App clone initiated!
  Source app: ${appId}
  Clone location: ${location}${domain ? `\n  Domain: ${domain}` : ''}${backupId ? `\n  From backup: ${backupId}` : ''}
  Task ID: ${taskId}

Use cloudron_task_status with taskId '${taskId}' to track clone progress.`,
            },
          ],
        };
      }

      case 'cloudron_repair_app': {
        const { appId } = args as { appId: string };
        const taskId = await cloudron.repairApp(appId);

        return {
          content: [
            {
              type: 'text' as const,
              text: `App repair initiated for: ${appId}
  Task ID: ${taskId}

Use cloudron_task_status with taskId '${taskId}' to track repair progress.`,
            },
          ],
        };
      }

      case 'cloudron_update_app': {
        const { appId, version, force } = args as { appId: string; version?: string; force?: boolean };
        const taskId = await cloudron.updateApp(appId, version, force);

        return {
          content: [
            {
              type: 'text' as const,
              text: `App update initiated for: ${appId}
  Target version: ${version ?? 'latest'}
  Force: ${force ? 'Yes' : 'No'}
  Task ID: ${taskId}

Use cloudron_task_status with taskId '${taskId}' to track update progress.`,
            },
          ],
        };
      }

      case 'cloudron_fetch_package_example': {
        const { appId } = args as { appId: string };
        const files = await cloudron.fetchPackageExample(appId);

        const sections: string[] = [`Package example for: ${appId}\n`];

        if (files.manifest) {
          sections.push(`## CloudronManifest.json\n\`\`\`json\n${files.manifest}\n\`\`\``);
        }
        if (files.dockerfile) {
          sections.push(`## Dockerfile\n\`\`\`dockerfile\n${files.dockerfile}\n\`\`\``);
        }
        if (files.startScript) {
          sections.push(`## start.sh\n\`\`\`bash\n${files.startScript}\n\`\`\``);
        }

        return {
          content: [{ type: 'text' as const, text: sections.join('\n\n') }],
        };
      }

      case 'cloudron_packaging_guide': {
        const { topic, appType } = args as { topic: string; appType?: string };

        const guides: Record<string, string> = {
          overview: `# Cloudron Packaging Overview

## Quick Start Workflow
1. Create CloudronManifest.json (required metadata)
2. Create Dockerfile (based on cloudron/base image)
3. Create start.sh (startup script)
4. Add test/test.js (integration tests)
5. Test locally with cloudron-selfhost
6. Submit to App Store

## Required Files
- \`CloudronManifest.json\` — App metadata and configuration
- \`Dockerfile\` — Build instructions (FROM cloudron/base:22.04)
- \`start.sh\` — Runtime startup script

## Key Principles
- Use \`cloudron/base\` as your base image (Ubuntu 22.04 + Cloudron tools)
- Store persistent data in \`/app/data/\`
- Expose app on port 8000 (or configured port)
- Health check at /healthcheck (returns 200)
- Use addons for databases, email, auth (never bundle)

## Resources
- Docs: https://docs.cloudron.io/packaging/
- Base image: https://github.com/cloudron-io/base
- Examples: https://git.cloudron.io/cloudron/`,

          manifest: `# CloudronManifest.json Reference

## Required Fields
\`\`\`json
{
  "id": "com.example.myapp",          // Reverse domain app ID
  "title": "My App",                   // Display name
  "author": "Your Name",
  "description": "What this app does",
  "tagline": "One-line summary",
  "version": "1.0.0",                  // Your app version
  "healthCheckPath": "/",              // Path returning 200 OK
  "httpPort": 8000,                    // Port your app listens on
  "addons": {                          // Required platform services
    "localstorage": {}
  },
  "manifestVersion": 2                 // Always 2
}
\`\`\`

## Common Addons
- \`localstorage: {}\` — Persistent file storage at /app/data
- \`mysql: {}\` — MySQL database (env: MYSQL_*)
- \`postgresql: {}\` — PostgreSQL (env: POSTGRESQL_*)
- \`mongodb: {}\` — MongoDB (env: MONGODB_*)
- \`redis: {}\` — Redis cache
- \`ldap: {}\` — LDAP auth (env: CLOUDRON_LDAP_*)
- \`oidc: {}\` — OAuth/OIDC SSO
- \`sendmail: {}\` — Outbound email
- \`recvmail: {}\` — Inbound email

## Optional Fields
- \`memoryLimit\`: Memory in bytes (default 256MB)
- \`minBoxVersion\`: Minimum Cloudron version
- \`website\`: App homepage URL
- \`icon\`: Path to icon file (512x512 PNG)
- \`screenshot\`: Path to screenshot`,

          dockerfile: `# Dockerfile Best Practices${appType ? ` (${appType})` : ''}

## Base Template
\`\`\`dockerfile
FROM cloudron/base:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \\
    your-package \\
 && rm -rf /var/lib/apt/lists/*

# Copy application
COPY . /app/code/

# Set working directory
WORKDIR /app/code

# Build step (if needed)
RUN npm install --production

# Copy startup script
ADD start.sh /app/code/start.sh
RUN chmod +x /app/code/start.sh

# Expose port
EXPOSE 8000

CMD ["/app/code/start.sh"]
\`\`\`
${appType === 'nodejs' ? `
## Node.js Specific
- Use \`cloudron/base:22.04\` (includes Node.js)
- Or install specific version: \`RUN apt-get install -y nodejs\`
- Run as non-root: \`USER cloudron\`
- Store node_modules in /app/code, data in /app/data` : ''}
${appType === 'php' ? `
## PHP Specific
- Install: \`RUN apt-get install -y php8.1 php8.1-fpm\`
- Use nginx + php-fpm pattern
- Config files go in /app/code, uploads in /app/data/uploads` : ''}

## Key Rules
- Always FROM cloudron/base:22.04
- Store state in /app/data (persisted)
- Store code in /app/code (ephemeral)
- Never run as root in production
- Clean up apt cache: rm -rf /var/lib/apt/lists/*`,

          addons: `# Cloudron Addons Reference

## Available Addons

### Storage
- **localstorage** — Persistent filesystem at /app/data
  \`"localstorage": {}\`

### Databases
- **mysql** — MySQL 8.x
  Env: MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD
- **postgresql** — PostgreSQL 14
  Env: POSTGRESQL_HOST, POSTGRESQL_PORT, POSTGRESQL_DATABASE, POSTGRESQL_USERNAME, POSTGRESQL_PASSWORD
- **mongodb** — MongoDB 6.x
  Env: MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, MONGODB_USERNAME, MONGODB_PASSWORD
- **redis** — Redis 7.x
  Env: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD

### Authentication
- **ldap** — LDAP directory (Cloudron users)
  Env: CLOUDRON_LDAP_SERVER, CLOUDRON_LDAP_PORT, CLOUDRON_LDAP_BIND_DN, CLOUDRON_LDAP_BIND_PASSWORD
- **oidc** — OpenID Connect SSO
  Env: CLOUDRON_OIDC_ISSUER, CLOUDRON_OIDC_CLIENT_ID, CLOUDRON_OIDC_CLIENT_SECRET

### Email
- **sendmail** — Outbound email (SMTP)
  Env: MAIL_SMTP_SERVER, MAIL_SMTP_PORT, MAIL_FROM
- **recvmail** — Inbound email (IMAP)
  Env: MAIL_IMAP_SERVER, MAIL_IMAP_PORT

### Other
- **scheduler** — Cron-like job scheduler`,

          testing: `# Cloudron Package Testing

## Integration Test Pattern (test/test.js)
\`\`\`javascript
import superagent from 'superagent';

const BASE_URL = 'http://localhost:8000';

describe('App health check', () => {
  it('should return 200 OK', async () => {
    const res = await superagent.get(\`\${BASE_URL}/\`);
    expect(res.status).toBe(200);
  });
});
\`\`\`

## Local Testing
\`\`\`bash
# Build image
docker build -t myapp .

# Run locally with Cloudron environment simulation
docker run -e CLOUDRON_APP_DOMAIN=test.cloudron.local \\
           -e MYSQL_HOST=localhost \\
           -p 8000:8000 \\
           myapp

# Run tests
npm test
\`\`\`

## Test Checklist
- [ ] Health check endpoint returns 200
- [ ] App starts without errors
- [ ] Data persists across container restarts
- [ ] LDAP/OIDC auth works (if configured)
- [ ] Email sending works (if using sendmail addon)
- [ ] No sensitive data in logs`,

          publishing: `# Publishing to Cloudron App Store

## Pre-submission Checklist
- [ ] CloudronManifest.json valid and complete
- [ ] App tested on real Cloudron instance
- [ ] Icon: 512x512 PNG
- [ ] Screenshot: 1280x800 PNG
- [ ] Integration tests passing
- [ ] CHANGELOG.md updated
- [ ] Version bumped in manifest

## Submission Process
1. Fork https://github.com/cloudron-io/store
2. Add your app's manifest to the repo
3. Submit a pull request
4. Cloudron team reviews and tests
5. Merged = published to App Store

## Hosting Your Package
\`\`\`bash
# Push to Docker Hub
docker build -t yourusername/myapp:1.0.0 .
docker push yourusername/myapp:1.0.0
\`\`\`

Or use git.cloudron.io (Gitea) for community packages.

## Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update \`version\` in CloudronManifest.json for each release
- Document changes in CHANGELOG.md`,
        };

        const content = guides[topic];
        if (!content) {
          return {
            content: [{ type: 'text' as const, text: `Unknown topic: ${topic}. Valid topics: overview, manifest, dockerfile, addons, testing, publishing` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      case 'cloudron_scaffold_package': {
        const {
          appName,
          appType,
          appId: providedAppId,
          description: appDescription,
          version = '1.0.0',
          httpPort = 8000,
          addons = ['localstorage'],
          authMethod = 'none',
          healthCheckPath = '/',
          website,
          memoryLimit = 268435456,
        } = args as {
          appName: string;
          appType: 'nodejs' | 'php' | 'python' | 'java' | 'go' | 'static';
          appId?: string;
          description?: string;
          version?: string;
          httpPort?: number;
          addons?: string[];
          authMethod?: string;
          healthCheckPath?: string;
          website?: string;
          memoryLimit?: number;
        };

        const appId = providedAppId ?? `io.cloudron.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const addonsObj = Object.fromEntries(addons.map(a => [a, {}]));
        if (authMethod === 'ldap') addonsObj.ldap = {};
        if (authMethod === 'oidc') addonsObj.oidc = {};

        const manifest = {
          id: appId,
          title: appName,
          author: '',
          description: appDescription ?? `${appName} packaged for Cloudron`,
          tagline: appDescription ?? appName,
          version,
          healthCheckPath,
          httpPort,
          addons: addonsObj,
          memoryLimit,
          ...(website && { website }),
          manifestVersion: 2,
        };

        const dockerfileTemplates: Record<string, string> = {
          nodejs: `FROM cloudron/base:22.04

RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

COPY package*.json /app/code/
WORKDIR /app/code
RUN npm install --production

COPY . /app/code/
ADD start.sh /app/code/start.sh
RUN chmod +x /app/code/start.sh

CMD ["/app/code/start.sh"]`,
          php: `FROM cloudron/base:22.04

RUN apt-get update && apt-get install -y php8.1 php8.1-fpm nginx && rm -rf /var/lib/apt/lists/*

COPY . /app/code/
ADD start.sh /app/code/start.sh
RUN chmod +x /app/code/start.sh

CMD ["/app/code/start.sh"]`,
          python: `FROM cloudron/base:22.04

RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/code/
WORKDIR /app/code
RUN pip3 install -r requirements.txt

COPY . /app/code/
ADD start.sh /app/code/start.sh
RUN chmod +x /app/code/start.sh

CMD ["/app/code/start.sh"]`,
          java: `FROM cloudron/base:22.04

RUN apt-get update && apt-get install -y openjdk-17-jre-headless && rm -rf /var/lib/apt/lists/*

COPY target/*.jar /app/code/app.jar
ADD start.sh /app/code/start.sh
RUN chmod +x /app/code/start.sh

CMD ["/app/code/start.sh"]`,
          go: `FROM cloudron/base:22.04

COPY myapp /app/code/myapp
RUN chmod +x /app/code/myapp

ADD start.sh /app/code/start.sh
RUN chmod +x /app/code/start.sh

CMD ["/app/code/start.sh"]`,
          static: `FROM cloudron/base:22.04

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

COPY . /app/code/
ADD start.sh /app/code/start.sh
ADD nginx.conf /etc/nginx/sites-available/default
RUN chmod +x /app/code/start.sh

CMD ["/app/code/start.sh"]`,
        };

        const startScriptTemplates: Record<string, string> = {
          nodejs: `#!/bin/bash
set -eu

echo "Starting ${appName}..."

# Initialize data directory
mkdir -p /app/data

# Start application
exec node /app/code/server.js`,
          php: `#!/bin/bash
set -eu

echo "Starting ${appName}..."

mkdir -p /app/data /run/php

# Start PHP-FPM
php-fpm8.1 -D

# Start nginx
exec nginx -g 'daemon off;'`,
          python: `#!/bin/bash
set -eu

echo "Starting ${appName}..."

mkdir -p /app/data

exec python3 /app/code/app.py`,
          java: `#!/bin/bash
set -eu

echo "Starting ${appName}..."

mkdir -p /app/data

exec java -jar /app/code/app.jar --server.port=${httpPort}`,
          go: `#!/bin/bash
set -eu

echo "Starting ${appName}..."

mkdir -p /app/data

exec /app/code/myapp`,
          static: `#!/bin/bash
set -eu

echo "Starting ${appName} (static site)..."

exec nginx -g 'daemon off;'`,
        };

        const testScript = `'use strict';

const superagent = require('superagent');
const expect = require('expect.js');

const BASE_URL = process.env.BASE_URL || 'http://localhost:${httpPort}';

describe('${appName} health check', function () {
  this.timeout(10000);

  it('should return 200 OK', function (done) {
    superagent.get(BASE_URL + '${healthCheckPath}').end(function (err, res) {
      expect(res.status).to.be(200);
      done(err);
    });
  });
});`;

        const output = `# ${appName} Package Scaffold

## CloudronManifest.json
\`\`\`json
${JSON.stringify(manifest, null, 2)}
\`\`\`

## Dockerfile
\`\`\`dockerfile
${dockerfileTemplates[appType] ?? dockerfileTemplates.nodejs}
\`\`\`

## start.sh
\`\`\`bash
${startScriptTemplates[appType] ?? startScriptTemplates.nodejs}
\`\`\`

## test/test.js
\`\`\`javascript
${testScript}
\`\`\`

## Next Steps
1. Save each file to your package directory
2. Customize the Dockerfile for your app's dependencies
3. Update start.sh with your app's startup command
4. Test locally: \`docker build -t ${appId} . && docker run -p ${httpPort}:${httpPort} ${appId}\`
5. Run integration tests: \`npm test\`
6. Use cloudron_fetch_package_example to see real-world examples`;

        return {
          content: [{ type: 'text' as const, text: output }],
        };
      }

      case 'cloudron_validate_package': {
        const { manifest, dockerfile, startScript } = args as {
          manifest?: string;
          dockerfile?: string;
          startScript?: string;
        };

        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!manifest && !dockerfile && !startScript) {
          return {
            content: [{
              type: 'text' as const,
              text: 'No package files provided. Pass manifest, dockerfile, or startScript content to validate.',
            }],
            isError: true,
          };
        }

        // Validate CloudronManifest.json
        if (manifest) {
          let parsed: Record<string, unknown> | null = null;
          try {
            parsed = JSON.parse(manifest);
          } catch {
            errors.push('CloudronManifest.json: Invalid JSON syntax');
          }

          if (parsed) {
            const requiredFields = ['id', 'title', 'author', 'description', 'tagline', 'version', 'healthCheckPath', 'httpPort', 'addons', 'manifestVersion'];
            for (const field of requiredFields) {
              if (!(field in parsed)) {
                errors.push(`CloudronManifest.json: Missing required field '${field}'`);
              }
            }
            if (parsed.manifestVersion !== 2) {
              errors.push('CloudronManifest.json: manifestVersion must be 2');
            }
            if (typeof parsed.id === 'string' && !/^[a-z][a-z0-9.]+[a-z0-9]$/.test(parsed.id)) {
              errors.push('CloudronManifest.json: id must be a reverse domain (e.g. com.example.myapp)');
            }
            if (typeof parsed.httpPort === 'number' && (parsed.httpPort < 1 || parsed.httpPort > 65535)) {
              errors.push(`CloudronManifest.json: httpPort ${parsed.httpPort} is out of valid range (1-65535)`);
            }
            if (!parsed.icon) {
              warnings.push('CloudronManifest.json: No icon specified (512x512 PNG recommended for App Store)');
            }
            if (!parsed.website) {
              suggestions.push('CloudronManifest.json: Consider adding a website URL');
            }
          }
        }

        // Validate Dockerfile
        if (dockerfile) {
          if (!dockerfile.includes('FROM cloudron/base')) {
            errors.push('Dockerfile: Must use cloudron/base as base image (e.g. FROM cloudron/base:22.04)');
          }
          if (!dockerfile.includes('start.sh')) {
            warnings.push('Dockerfile: No start.sh referenced — ensure startup script is included');
          }
          if (dockerfile.includes('apt-get') && !dockerfile.includes('rm -rf /var/lib/apt/lists')) {
            warnings.push('Dockerfile: Missing apt-get cache cleanup — add: rm -rf /var/lib/apt/lists/*');
          }
          if (dockerfile.includes('USER root') || (!dockerfile.includes('USER ') && dockerfile.includes('CMD'))) {
            suggestions.push('Dockerfile: Consider running as non-root user for security');
          }
        }

        // Validate start.sh
        if (startScript) {
          if (!startScript.startsWith('#!/')) {
            errors.push('start.sh: Missing shebang line (e.g. #!/bin/bash)');
          }
          if (!startScript.includes('set -e') && !startScript.includes('set -eu')) {
            warnings.push('start.sh: Missing "set -eu" — script may not fail on errors');
          }
          if (!startScript.includes('/app/data')) {
            suggestions.push('start.sh: Consider using /app/data for persistent storage');
          }
        }

        const valid = errors.length === 0;
        const summary = valid
          ? `✅ Package validation passed${warnings.length > 0 ? ` (${warnings.length} warning(s))` : ''}`
          : `❌ Package validation failed (${errors.length} error(s))`;

        const sections = [summary];
        if (errors.length > 0) sections.push(`\nErrors:\n${errors.map(e => `  • ${e}`).join('\n')}`);
        if (warnings.length > 0) sections.push(`\nWarnings:\n${warnings.map(w => `  ⚠ ${w}`).join('\n')}`);
        if (suggestions.length > 0) sections.push(`\nSuggestions:\n${suggestions.map(s => `  💡 ${s}`).join('\n')}`);

        return {
          content: [{ type: 'text' as const, text: sections.join('') }],
          isError: !valid,
        };
      }

      default:
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const message = isCloudronError(error)
      ? `Cloudron API Error: ${error.message} (${error.statusCode ?? 'unknown'})`
      : error instanceof Error
        ? error.message
        : 'Unknown error occurred';

    return {
      content: [{ type: 'text' as const, text: message }],
      isError: true,
    };
  }
});

// Main entry point
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cloudron MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
