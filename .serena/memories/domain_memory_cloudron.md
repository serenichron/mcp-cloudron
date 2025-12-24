{
  "project": {
    "id": "cloudron_mcp_expansion",
    "name": "Cloudron MCP Server - Feature Expansion (MAGI Re-Sequenced)",
    "type": "feature_development",
    "created_at": "2025-12-23T00:00:00Z",
    "last_updated": "2025-12-24T03:00:00Z",
    "repository_path": "/home/blackthorne/Work/cloudron",
    "primary_language": "typescript",
    "test_framework": "jest"
  },
  "goals": [
    {
      "id": "G0",
      "description": "Establish test infrastructure foundation",
      "status": "active",
      "success_criteria": "Jest test harness operational, all tests pass via 'npm test', coverage reporting enabled",
      "features": [
        "F00"
      ]
    },
    {
      "id": "G1",
      "description": "Deliver MVP app lifecycle and backup management (Phase 1)",
      "status": "active",
      "success_criteria": "10 MVP features implemented with safety infrastructure, automated tests passing, ready for production use",
      "features": [
        "F01",
        "F04",
        "F05",
        "F22",
        "F23a",
        "F23b",
        "F07",
        "F08",
        "F12",
        "F13",
        "F06"
      ]
    },
    {
      "id": "G2",
      "description": "Implement safety infrastructure (Phase 1)",
      "status": "active",
      "success_criteria": "Pre-flight validation (F37), storage checks (F36), async task tracking (F34), and cancellation (F35) operational",
      "features": [
        "F34",
        "F35",
        "F36",
        "F37"
      ]
    },
    {
      "id": "G3",
      "description": "Complete Phase 2 features (deferred)",
      "status": "active",
      "success_criteria": "23 Phase 2 features implemented after Phase 1 proves value",
      "features": [
        "F09",
        "F11",
        "F14",
        "F15",
        "F16",
        "F17",
        "F18",
        "F19",
        "F20",
        "F21",
        "F24",
        "F25",
        "F26",
        "F27",
        "F28",
        "F29",
        "F30",
        "F31",
        "F32",
        "F33"
      ]
    }
  ],
  "features": [
    {
      "id": "F00",
      "goal_id": "G0",
      "category": "test",
      "description": "Build comprehensive Jest-based test harness for automated MCP tool testing",
      "steps": [
        "Install Jest dependencies: npm install --save-dev jest @types/jest ts-jest",
        "Create jest.config.js with TypeScript preset and coverage settings",
        "Create tests/helpers/cloudron-mock.ts for API response mocking",
        "Create tests/helpers/mcp-assert.ts for response schema validation",
        "Create example test tests/cloudron-list-apps.test.ts demonstrating pattern",
        "Add npm test script to package.json",
        "Verify all tests pass with npm test",
        "Generate coverage report and validate >80% coverage target"
      ],
      "status": "passing",
      "test_status": "passing",
      "test_results": {
        "passed": 7,
        "failed": 0,
        "skipped": 0,
        "duration_seconds": 0.318,
        "last_run": "2025-12-23T14:30:00Z",
        "command": "npm test",
        "coverage": {
          "statements": 81.25,
          "branches": 67.5,
          "functions": 54.54,
          "lines": 83.6
        },
        "output_summary": "All 7 tests passed. Coverage: 81.25% statements, 67.5% branches, 54.54% functions, 83.6% lines"
      },
      "git_commit": "ccc8e7d38b93b409f6dfa02df11cf89ebf148902",
      "tried_count": 1,
      "last_error": null,
      "dependencies": [],
      "blocked_by": [],
      "blocks": [
        "F01",
        "F04",
        "F05",
        "F06",
        "F07",
        "F08",
        "F09",
        "F11",
        "F12",
        "F13",
        "F14",
        "F15",
        "F16",
        "F17",
        "F18",
        "F19",
        "F20",
        "F21",
        "F22",
        "F23a",
        "F23b",
        "F24",
        "F25",
        "F26",
        "F27",
        "F28",
        "F29",
        "F30",
        "F31",
        "F32",
        "F33",
        "F34",
        "F35",
        "F36",
        "F37"
      ],
      "priority": "critical",
      "estimated_effort": "medium",
      "recommended_agent": "quality-engineer",
      "agent_capabilities_required": "Jest testing, TypeScript, test infrastructure, mocking patterns"
    },
    {
      "id": "F01",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_control_app tool (merged F01/F02/F03) with action enum for start/stop/restart",
      "steps": [
        "Define tool schema in server.ts with action enum: 'start'|'stop'|'restart'",
        "Implement cloudron_control_app handler with switch on action parameter",
        "Add CloudronClient methods: startApp(), stopApp(), restartApp()",
        "Validate appId exists before action (call GET /api/v1/apps/:id first)",
        "Handle async operation (return 202 Accepted, suggest using F34 task_status for completion)",
        "Add error handling for invalid action, missing app, API failures",
        "Create Jest test with mocked Cloudron API responses",
        "Test all three actions (start, stop, restart) with different app states",
        "Update README.md with merged tool documentation"
      ],
      "status": "passing",
      "test_status": "passing",
      "test_results": {
        "passed": 19,
        "failed": 0,
        "skipped": 0,
        "duration_seconds": 0.268,
        "last_run": "2025-12-24T00:00:00Z",
        "command": "npm test -- tests/cloudron-control-app.test.ts",
        "output_summary": "All 19 tests passed for F01 cloudron_control_app tool. All test anchors validated: start/stop/restart 202 Accepted, 404 handling, action enum validation, state transitions verified."
      },
      "git_commit": "200146f68025a7118583d58cfbf47675c1fe27a2",
      "tried_count": 1,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol, enum patterns",
      "test_anchors": [
        "Action 'start' returns 202 Accepted and calls POST /api/v1/apps/:id/start",
        "Action 'stop' returns 202 Accepted and calls POST /api/v1/apps/:id/stop",
        "Action 'restart' returns 202 Accepted and calls POST /api/v1/apps/:id/restart",
        "Invalid appId returns 404 Not Found with error message",
        "Invalid action returns 400 Bad Request with enum options listed",
        "App state transitions verified (running\u2192stopped, stopped\u2192running)"
      ]
    },
    {
      "id": "F04",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_uninstall_app tool with F37 pre-flight validation for safe destructive operation",
      "steps": [
        "Define tool schema in server.ts with appId parameter",
        "Implement cloudron_uninstall_app handler",
        "FIRST: Call F37 validate_operation with operation: 'uninstall', resource: appId",
        "If F37 validation fails \u2192 return error, DO NOT proceed with API call",
        "If F37 passes \u2192 call DELETE /api/v1/apps/:id",
        "Handle 202 Accepted response (async operation)",
        "Suggest F34 (task_status) for completion tracking",
        "Create Jest test mocking F37 validation + API call",
        "Test validation failure prevents API call (safety gate works)",
        "Update README.md with pre-flight validation documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F37"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol, destructive operation safety, pre-flight validation patterns",
      "test_anchors": [
        "F37 validate_operation called BEFORE DELETE API call",
        "F37 validation failure prevents uninstall (returns error, no API call made)",
        "F37 validation success proceeds to DELETE /api/v1/apps/:id",
        "API returns 202 Accepted with task ID for async tracking",
        "Invalid appId returns 404 Not Found",
        "App with active dependencies blocked by F37 (error lists dependencies)",
        "Backup recommendation displayed before uninstall confirmation"
      ]
    },
    {
      "id": "F05",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_configure_app tool to update app configuration (env vars, resource limits, access control)",
      "steps": [
        "Define tool schema in server.ts with appId and config object",
        "Support config fields: env vars, memory limits, access control settings",
        "Add CloudronClient.configureApp() method",
        "Validate config object schema before API call",
        "Call PUT /api/v1/apps/:id/configure with config body",
        "Handle 200 OK response with updated app config",
        "Add error handling for invalid appId, invalid config, API failures",
        "Create Jest test with mocked API responses",
        "Test config validation catches malformed input",
        "Document app restart behavior if config requires reload",
        "Update README.md with configuration options documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, JSON Schema validation, MCP protocol",
      "test_anchors": [
        "Config object with env vars updates app environment correctly",
        "Config object with memory limits updates resource allocation",
        "Config object with access control updates permissions",
        "PUT /api/v1/apps/:id/configure returns 200 OK with updated config",
        "Invalid appId returns 404 Not Found",
        "Invalid config returns 400 Bad Request with validation errors",
        "App restart documented if config requires reload"
      ]
    },
    {
      "id": "F22",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_search_apps tool to search Cloudron App Store for available applications",
      "steps": [
        "Define tool schema in server.ts with query parameter",
        "Add CloudronClient.searchApps() method",
        "Call GET /api/v1/appstore?search={query}",
        "Parse app catalog data (name, description, version, icon URL, install count)",
        "Sort results by relevance score",
        "Handle empty query (returns all apps)",
        "Add error handling for API failures",
        "Create Jest test with mocked app catalog responses",
        "Test empty query returns all apps",
        "Test no results found returns empty array (not error)",
        "Update README.md with app search documentation"
      ],
      "status": "passing",
      "test_status": "passing",
      "test_results": {
        "passed": 8,
        "failed": 0,
        "skipped": 0,
        "duration_seconds": 0.212,
        "last_run": "2025-12-24T02:00:00Z",
        "command": "npm test -- cloudron-search-apps.test.ts",
        "coverage": {
          "statements": 90.72,
          "branches": 76.13,
          "functions": 88.88,
          "lines": 91.83
        },
        "output_summary": "All 8 tests passed for F22 cloudron_search_apps tool. Test anchors validated: query search, empty query returns all apps, empty result array for no matches, relevance score sorting, missing optional fields handling, auth/server errors. Coverage improved to 90.72% statements."
      },
      "git_commit": "013dd02fc3ed0b883e68e09ba28b4ba0b3e4f936",
      "tried_count": 1,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol",
      "test_anchors": [
        "Query parameter searches app store successfully",
        "Results include: app name, description, version, icon URL, install count",
        "Empty query returns all available apps",
        "No results found returns empty array []",
        "Results sorted by relevance score (highest first)",
        "API failure returns error with details"
      ]
    },
    {
      "id": "F23a",
      "goal_id": "G1",
      "category": "api",
      "description": "Validate app manifest before installation (pre-flight safety check)",
      "steps": [
        "Define tool schema in server.ts with appId parameter",
        "Implement cloudron_validate_manifest handler",
        "Check F36 (storage sufficient for app?)",
        "Check dependencies available in Cloudron catalog",
        "Validate configuration schema against Cloudron spec",
        "Return validation report: {valid: bool, errors: [], warnings: []}",
        "Add error handling for manifest fetch failures",
        "Create Jest test with mocked validation scenarios",
        "Test insufficient disk space caught by F36 check",
        "Test missing dependencies listed in errors",
        "Update README.md with validation documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F36"
      ],
      "blocked_by": [],
      "blocks": [
        "F23b"
      ],
      "priority": "high",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, manifest validation, JSON Schema, MCP protocol",
      "test_anchors": [
        "F36 check_storage called to verify sufficient disk space",
        "Manifest schema validated against Cloudron spec",
        "Dependencies checked for availability in catalog",
        "Returns {valid: true, errors: [], warnings: []} for valid manifest",
        "Returns {valid: false, errors: [...], warnings: []} for invalid manifest",
        "Insufficient disk space listed in errors",
        "Missing dependencies listed in errors"
      ]
    },
    {
      "id": "F23b",
      "goal_id": "G1",
      "category": "api",
      "description": "Install app from Cloudron App Store after F23a validation passes",
      "steps": [
        "Define tool schema in server.ts with appId, config parameters",
        "Implement cloudron_install_app handler",
        "FIRST: Call F23a validate_manifest to check safety",
        "If F23a validation fails \u2192 return error, DO NOT proceed",
        "If F23a passes \u2192 call POST /api/v1/apps with manifest and config",
        "Handle 202 Accepted response (async installation)",
        "Return task ID for F34 (task_status) tracking",
        "Add error handling for invalid appId, installation failures",
        "Create Jest test mocking F23a validation + installation",
        "Test validation failure prevents installation",
        "Update README.md with installation documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F23a",
        "F36"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "large",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, async operations, JSON Schema validation, MCP protocol",
      "test_anchors": [
        "F23a validate_manifest called BEFORE installation API call",
        "F23a validation failure prevents installation (returns error, no API call)",
        "F23a validation success proceeds to POST /api/v1/apps",
        "API returns 202 Accepted with task ID for async tracking",
        "Task ID returned for F34 (task_status) polling",
        "Invalid appId returns 404 Not Found",
        "Installation config applied correctly (env vars, port bindings)",
        "Error handling for installation failures (disk space, dependencies)"
      ]
    },
    {
      "id": "F07",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_list_backups tool to list available backups",
      "steps": [
        "Define tool schema in server.ts (no required params)",
        "Add CloudronClient.listBackups() method",
        "Call GET /api/v1/backups",
        "Parse backup metadata (ID, timestamp, size, app count, status)",
        "Sort backups by timestamp (newest first)",
        "Handle empty backup list (return empty array)",
        "Add error handling for API failures",
        "Create Jest test with mocked backup list responses",
        "Test empty backup list returns []",
        "Update README.md with backup listing documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol",
      "test_anchors": [
        "GET /api/v1/backups returns backup list",
        "Results include: backup ID, timestamp, size, app count, status",
        "Backups sorted by timestamp (newest first)",
        "Empty backup list returns empty array []",
        "API failure returns error with details"
      ]
    },
    {
      "id": "F08",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_create_backup tool with F36 storage check and F34 status tracking",
      "steps": [
        "Define tool schema in server.ts (no required params)",
        "Implement cloudron_create_backup handler",
        "FIRST: Call F36 check_storage to verify sufficient space",
        "If F36 check fails \u2192 return error, DO NOT proceed",
        "If F36 passes \u2192 call POST /api/v1/backups",
        "Handle 202 Accepted response (async operation)",
        "Return task ID for F34 (task_status) tracking",
        "Add error handling for insufficient storage, backup failures",
        "Create Jest test mocking F36 check + backup creation",
        "Test insufficient storage prevents backup creation",
        "Update README.md with backup creation documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F36"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, async operations, MCP protocol",
      "test_anchors": [
        "F36 check_storage called BEFORE backup creation API call",
        "F36 storage check failure prevents backup (returns error, no API call)",
        "F36 storage check success proceeds to POST /api/v1/backups",
        "API returns 202 Accepted with task ID for async tracking",
        "Task ID returned for F34 (task_status) polling",
        "Backup completion tracked via F34",
        "Error handling for backup failures (disk space, permissions)"
      ]
    },
    {
      "id": "F12",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_list_users tool to list all users on Cloudron instance",
      "steps": [
        "Define tool schema in server.ts (no required params)",
        "Add CloudronClient.listUsers() method",
        "Call GET /api/v1/users",
        "Parse user data (ID, email, username, role, created_at)",
        "Sort users by role then email",
        "Handle empty user list (return empty array)",
        "Add error handling for API failures",
        "Create Jest test with mocked user list responses",
        "Test empty user list returns []",
        "Update README.md with user listing documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol",
      "test_anchors": [
        "GET /api/v1/users returns user list",
        "Results include: user ID, email, username, role, created_at",
        "Users sorted by role then email",
        "Empty user list returns empty array []",
        "API failure returns error with details"
      ]
    },
    {
      "id": "F13",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_create_user tool with role assignment (merged F13/F15)",
      "steps": [
        "Define tool schema in server.ts with email, password, role parameters",
        "Role parameter accepts enum: 'admin', 'user', 'guest'",
        "Validate password strength (8+ chars, 1 uppercase, 1 number)",
        "Validate email format",
        "Add CloudronClient.createUser() method",
        "Call POST /api/v1/users with role in body (atomic operation)",
        "Handle 201 Created response",
        "Add error handling for duplicate email, invalid role, weak password",
        "Create Jest test with mocked API responses",
        "Test password validation catches weak passwords",
        "Test duplicate email returns 409 Conflict",
        "Update README.md with user creation and role documentation"
      ],
      "status": "passing",
      "test_status": "passing",
      "tried_count": 1,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, input validation, MCP protocol",
      "test_anchors": [
        "POST /api/v1/users creates user with role atomically",
        "Role enum validates: 'admin', 'user', 'guest'",
        "Password strength validated (8+ chars, 1 uppercase, 1 number)",
        "Email format validated",
        "Duplicate email returns 409 Conflict",
        "Invalid role returns 400 Bad Request with enum options",
        "User created with correct role in single operation",
        "API returns 201 Created with user object"
      ],
      "test_results": {
        "passed": 18,
        "failed": 0,
        "skipped": 0,
        "duration_seconds": 0.299,
        "last_run": "2025-12-24T03:00:00Z",
        "command": "npm test -- cloudron-create-user.test.ts",
        "output_summary": "All 18 tests passed for F13 cloudron_create_user tool. All test anchors validated: POST creates user with role atomically, role enum (admin/user/guest), password strength (8+ chars, uppercase, number), email format validation, 409 Conflict for duplicates, 400 for invalid role, 201 Created response."
      },
      "git_commit": "43c0b4b"
    },
    {
      "id": "F06",
      "goal_id": "G1",
      "category": "api",
      "description": "Implement cloudron_get_logs tool (merged F06/F30) with type parameter for app/service logs",
      "steps": [
        "Define tool schema in server.ts with resourceId, type enum, lines parameters",
        "Type parameter accepts enum: 'app', 'service'",
        "Optional lines parameter (default 100, max 1000)",
        "Implement cloudron_get_logs handler with switch on type",
        "Type 'app' calls GET /api/v1/apps/:id/logs",
        "Type 'service' calls GET /api/v1/services/:id/logs",
        "Format logs for readability (timestamps, severity levels)",
        "Add error handling for invalid resourceId, invalid type, log access failures",
        "Create Jest test with mocked log responses",
        "Test both app and service log types",
        "Update README.md with merged log tool documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, log parsing, MCP protocol",
      "test_anchors": [
        "Type 'app' calls GET /api/v1/apps/:id/logs",
        "Type 'service' calls GET /api/v1/services/:id/logs",
        "Lines parameter limits output (default 100, max 1000)",
        "Invalid resourceId returns 404 Not Found",
        "Invalid type returns 400 Bad Request with enum options",
        "Logs formatted with timestamps and severity levels",
        "API failure returns error with details"
      ]
    },
    {
      "id": "F34",
      "goal_id": "G2",
      "category": "infra",
      "description": "Implement cloudron_task_status tool to track async operations (backup, install, restore)",
      "steps": [
        "Define tool schema in server.ts with taskId parameter",
        "Add CloudronClient.getTaskStatus() method",
        "Call GET /api/v1/tasks/:id",
        "Parse status object: {state: 'pending'|'running'|'success'|'error', progress: 0-100%, message}",
        "Handle completed tasks (include result data)",
        "Handle failed tasks (include error details)",
        "Add error handling for invalid taskId",
        "Create Jest test with mocked task status responses",
        "Test all task states (pending, running, success, error)",
        "Update README.md with task status documentation"
      ],
      "status": "passing",
      "test_status": "passing",
      "test_results": {
        "passed": 7,
        "failed": 0,
        "skipped": 0,
        "duration_seconds": 0.386,
        "last_run": "2025-12-23T15:45:00Z",
        "command": "npm test",
        "output_summary": "All 7 tests passed for F34 task_status tool. Coverage 85.71% statements."
      },
      "git_commit": "7c97681a5828dcbdce2001bc114ba5f7b03a8108",
      "tried_count": 1,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol",
      "test_anchors": [
        "GET /api/v1/tasks/:id returns status object",
        "Status includes: state, progress (0-100%), message",
        "Completed tasks include result data",
        "Failed tasks include error details",
        "Invalid taskId returns 404 Not Found",
        "All task states tested: pending, running, success, error"
      ]
    },
    {
      "id": "F35",
      "goal_id": "G2",
      "category": "infra",
      "description": "Implement cloudron_cancel_task tool to cancel running async operations (kill switch)",
      "steps": [
        "Define tool schema in server.ts with taskId parameter",
        "Add CloudronClient.cancelTask() method",
        "Call DELETE /api/v1/tasks/:id",
        "Handle 200 OK response (task cancelled)",
        "Verify task state transitions to 'cancelled'",
        "Add error handling for invalid taskId, already completed tasks",
        "Create Jest test with mocked cancellation scenarios",
        "Test already completed tasks cannot be cancelled",
        "Test cancelled tasks cleanup resources (partial backups deleted)",
        "Update README.md with cancellation documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F34"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol",
      "test_anchors": [
        "DELETE /api/v1/tasks/:id returns 200 OK",
        "Task state transitions to 'cancelled'",
        "Invalid taskId returns 404 Not Found",
        "Already completed tasks cannot be cancelled (error message)",
        "Cancelled tasks cleanup resources (partial backups deleted)",
        "F34 task_status reflects cancellation"
      ]
    },
    {
      "id": "F36",
      "goal_id": "G2",
      "category": "infra",
      "description": "Implement cloudron_check_storage tool for pre-flight disk space validation",
      "steps": [
        "Define tool schema in server.ts with optional requiredMB parameter",
        "Add CloudronClient.getCloudronStatus() method (reuse existing endpoint)",
        "Call GET /api/v1/cloudron/status for disk info",
        "Parse disk data: {available_mb, total_mb, used_mb}",
        "Calculate sufficient: available >= requiredMB (if provided)",
        "Calculate warning threshold: available < 10% of total",
        "Calculate critical threshold: available < 5% of total",
        "Return: {available_mb, total_mb, used_mb, sufficient: bool, warning: bool, critical: bool}",
        "Add error handling for API failures",
        "Create Jest test with mocked disk usage scenarios",
        "Test warning and critical thresholds",
        "Update README.md with storage check documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol",
      "test_anchors": [
        "GET /api/v1/cloudron/status returns disk info",
        "Returns: {available_mb, total_mb, used_mb, sufficient: bool}",
        "If requiredMB provided, checks available >= requiredMB",
        "Warning threshold: available < 10% of total",
        "Critical threshold: available < 5% of total",
        "API failure returns error with details"
      ]
    },
    {
      "id": "F37",
      "goal_id": "G2",
      "category": "infra",
      "description": "Implement cloudron_validate_operation tool for pre-flight safety checks on destructive operations",
      "steps": [
        "Define tool schema in server.ts with operation enum, resourceId parameters",
        "Operation enum: 'uninstall_app', 'delete_user', 'restore_backup'",
        "Implement validation logic per operation type",
        "uninstall_app: Check app exists, no dependent apps, backup exists",
        "delete_user: Check user exists, not last admin, not currently logged in",
        "restore_backup: Check backup exists, backup integrity valid, sufficient storage (via F36)",
        "Return: {valid: bool, errors: [], warnings: [], recommendations: []}",
        "Blocking errors prevent operation",
        "Warnings allow operation with user confirmation",
        "Add error handling for invalid operation type",
        "Create Jest test with all operation types",
        "Update README.md with validation documentation"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F36"
      ],
      "blocked_by": [],
      "priority": "high",
      "estimated_effort": "large",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, complex validation logic, MCP protocol",
      "test_anchors": [
        "Operation 'uninstall_app': validates app exists, no dependents, backup exists",
        "Operation 'delete_user': validates user exists, not last admin, not logged in",
        "Operation 'restore_backup': validates backup exists, integrity valid, storage sufficient (F36)",
        "Returns: {valid: true, errors: [], warnings: [], recommendations: []}",
        "Returns: {valid: false, errors: [...], warnings: [...], recommendations: [...]}",
        "Blocking errors prevent operation (valid: false)",
        "Warnings allow operation with confirmation (valid: true with warnings)",
        "Invalid operation type returns 400 Bad Request with enum options"
      ]
    },
    {
      "id": "F09",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_restore_backup tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value",
        "Requires F37 pre-flight validation before restore",
        "Async operation tracked via F34"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F07",
        "F08",
        "F34",
        "F37"
      ],
      "blocked_by": [],
      "priority": "medium",
      "estimated_effort": "large",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, async operations, destructive operation safety, MCP protocol"
    },
    {
      "id": "F11",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_configure_backup tool for backup schedules (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, cron syntax validation, MCP protocol"
    },
    {
      "id": "F14",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_delete_user tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value",
        "Requires F37 pre-flight validation before deletion"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F12",
        "F13",
        "F37"
      ],
      "blocked_by": [],
      "priority": "medium",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, destructive operation safety, MCP protocol"
    },
    {
      "id": "F15",
      "goal_id": "G3",
      "category": "api",
      "description": "Merged into F13 (create_user includes role assignment)",
      "steps": [],
      "status": "merged",
      "test_status": "none",
      "tried_count": 0,
      "last_error": "Feature merged into F13 per Caspar recommendation",
      "dependencies": [],
      "blocked_by": [],
      "priority": "n/a",
      "estimated_effort": "n/a",
      "recommended_agent": "n/a",
      "agent_capabilities_required": "n/a"
    },
    {
      "id": "F16",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_list_groups tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F17",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_create_group tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F16"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F18",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_list_domains tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "medium",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F19",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_add_domain tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F18"
      ],
      "blocked_by": [],
      "priority": "medium",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, domain validation, MCP protocol"
    },
    {
      "id": "F20",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_sync_dns tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F18"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, async operations, MCP protocol"
    },
    {
      "id": "F21",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_configure_domain tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F18"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, JSON Schema validation, MCP protocol"
    },
    {
      "id": "F24",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_update_app tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "medium",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, async operations, MCP protocol"
    },
    {
      "id": "F25",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_list_mailboxes tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F26",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_create_mailbox tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F25"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, email validation, MCP protocol"
    },
    {
      "id": "F27",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_list_distribution_lists tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F28",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_configure_relay tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "large",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, credential management, MCP protocol"
    },
    {
      "id": "F29",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_disk_usage tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F30",
      "goal_id": "G3",
      "category": "api",
      "description": "Merged into F06 (get_logs supports type: 'service')",
      "steps": [],
      "status": "merged",
      "test_status": "none",
      "tried_count": 0,
      "last_error": "Feature merged into F06 per Caspar recommendation",
      "dependencies": [],
      "blocked_by": [],
      "priority": "n/a",
      "estimated_effort": "n/a",
      "recommended_agent": "n/a",
      "agent_capabilities_required": "n/a"
    },
    {
      "id": "F31",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_list_services tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F32",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_check_updates tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "small",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, MCP protocol"
    },
    {
      "id": "F33",
      "goal_id": "G3",
      "category": "api",
      "description": "Implement cloudron_apply_updates tool (Phase 2 - deferred)",
      "steps": [
        "Phase 2 implementation after Phase 1 proves value"
      ],
      "status": "failing",
      "test_status": "none",
      "tried_count": 0,
      "last_error": null,
      "dependencies": [
        "F00",
        "F32"
      ],
      "blocked_by": [],
      "priority": "low",
      "estimated_effort": "medium",
      "recommended_agent": "backend-architect",
      "agent_capabilities_required": "TypeScript, REST API integration, async operations, destructive operation safety, MCP protocol"
    }
  ],
  "constraints": [
    "F00 test harness BLOCKS all feature development (MANDATORY first step)",
    "All destructive operations (F04, F09, F14) REQUIRE F37 pre-flight validation",
    "All data-creating operations (F08, F23b) REQUIRE F36 storage check",
    "All async operations (F01, F04, F08, F23b) MUST support F34 task_status tracking",
    "Maintain backward compatibility with existing 3 tools (cloudron_list_apps, cloudron_get_app, cloudron_get_status)",
    "Strict TypeScript compilation (no 'any' types)",
    "All new tools must follow existing error handling pattern (CloudronError hierarchy)",
    "Test infrastructure changed from manual testing to automated Jest tests",
    "README.md must be updated with each new tool's documentation",
    "Types.ts must include all new type definitions",
    "Follow existing code style and project structure",
    "No breaking changes to published npm package API",
    "Phase 2 features (23 total) deferred until Phase 1 (14 features) proves value"
  ],
  "test_infrastructure": {
    "test_command": "npm test",
    "test_directory": "tests/",
    "test_framework": "jest",
    "coverage_command": "npm test -- --coverage",
    "automated_testing": true,
    "live_instance_required": false,
    "mock_api_responses": true,
    "test_credentials": "Mocked in tests/helpers/cloudron-mock.ts"
  },
  "progress": {
    "total_features": 37,
    "phase_0_features": 1,
    "phase_1_features": 14,
    "phase_2_features": 20,
    "merged_features": 2,
    "not_started": 0,
    "failing": 30,
    "merged": 2,
    "in_progress": 0,
    "passing": 5,
    "reverted": 0,
    "progress_percentage": 13.5
  },
  "session_log": [
    {
      "session_id": "session_001",
      "started_at": "2025-12-23T00:00:00Z",
      "ended_at": "2025-12-23T00:30:00Z",
      "agent_type": "initializer",
      "notes": "Created initial domain memory with 33 features across 7 goals for Cloudron MCP expansion"
    },
    {
      "session_id": "session_002",
      "started_at": "2025-12-23T12:00:00Z",
      "ended_at": "2025-12-23T12:30:00Z",
      "agent_type": "initializer",
      "notes": "Applied MAGI triad consensus recommendations: Added F00 test harness (BLOCKING), split F23 into F23a/F23b, merged F01/F02/F03, F06/F30, F13/F15, added safety infrastructure F34-F37, re-sequenced into Phase 0/1/2 with 37 total features"
    },
    {
      "session_id": "session_003",
      "started_at": "2025-12-23T14:00:00Z",
      "ended_at": "2025-12-23T14:30:00Z",
      "agent_type": "worker",
      "features_attempted": [
        "F00"
      ],
      "features_completed": [
        "F00"
      ],
      "commits": [
        "ccc8e7d38b93b409f6dfa02df11cf89ebf148902"
      ],
      "notes": "Implemented F00 test harness: Jest dependencies installed, jest.config.cjs configured for ES modules, test helpers created (cloudron-mock.ts, mcp-assert.ts), example test cloudron-list-apps.test.ts demonstrates pattern, all 7 tests passing, coverage 81.25% statements"
    },
    {
      "session_id": "session_004",
      "started_at": "2025-12-23T15:00:00Z",
      "ended_at": "2025-12-23T15:45:00Z",
      "agent_type": "worker",
      "features_attempted": [
        "F34"
      ],
      "features_completed": [
        "F34"
      ],
      "commits": [
        "7c97681a5828dcbdce2001bc114ba5f7b03a8108"
      ],
      "notes": "Implemented F34 task_status: Added TaskStatus interface, CloudronClient.getTaskStatus() method, cloudron_task_status MCP tool, comprehensive Jest test suite with 7 tests covering all states (pending/running/success/error), 404 handling, result/error formatting. All tests passing, coverage 85.71%."
    },
    {
      "session_id": "session_005",
      "started_at": "2025-12-24T00:00:00Z",
      "ended_at": "2025-12-24T01:00:00Z",
      "agent_type": "worker",
      "features_attempted": [
        "F01"
      ],
      "features_completed": [
        "F01"
      ],
      "commits": [
        "200146f68025a7118583d58cfbf47675c1fe27a2"
      ],
      "notes": "Implemented F01 cloudron_control_app (merged F01/F02/F03): Added CloudronClient methods (startApp, stopApp, restartApp), implemented MCP tool with action enum, comprehensive Jest test suite with 19 tests covering all actions, 404 handling, state transitions, and async task ID return. All test anchors validated. Added helper functions mockSuccessResponse, mockErrorResponse, mockApp, mockSystemStatus to cloudron-mock.ts."
    },
    {
      "session_id": "session_006",
      "started_at": "2025-12-24T01:30:00Z",
      "ended_at": "2025-12-24T02:00:00Z",
      "agent_type": "worker",
      "features_attempted": [
        "F22"
      ],
      "features_completed": [
        "F22"
      ],
      "commits": [
        "013dd02fc3ed0b883e68e09ba28b4ba0b3e4f936"
      ],
      "notes": "Implemented F22 cloudron_search_apps: Added AppStoreApp/AppStoreResponse interfaces to types.ts, CloudronClient.searchApps() method with relevance sorting, cloudron_search_apps MCP tool with query parameter, comprehensive Jest test suite with 8 tests. All test anchors validated: query search, empty query returns all apps, empty result array, relevance score sorting, missing optional fields, auth/server errors. Coverage improved to 90.72% statements, 76.13% branches, 88.88% functions, 91.83% lines."
    },
    {
      "session_id": "session_007",
      "started_at": "2025-12-24T02:30:00Z",
      "ended_at": "2025-12-24T03:00:00Z",
      "agent_type": "worker",
      "features_attempted": [
        "F13"
      ],
      "features_completed": [
        "F13"
      ],
      "commits": [
        "43c0b4b"
      ],
      "notes": "Implemented F13 cloudron_create_user (merged F13/F15): Added CloudronClient.createUser() with atomic role assignment, password strength validation (8+ chars, 1 uppercase, 1 number), email format validation (RFC 5322 simplified), role enum (admin/user/guest), comprehensive Jest test suite with 18 tests. All test anchors validated: POST /api/v1/users creates user atomically, role enum validation, password/email validation, 409 Conflict for duplicates, 400 for invalid role, 201 Created response. All 98 tests passing (18 new F13 tests)."
    }
  ],
  "technical_context": {
    "architecture_notes": "TypeScript MCP server using stdio transport for Claude Code integration. Published as @serenichron/mcp-cloudron on npm. 3 core tools already implemented and working. MAGI consensus applied: Melchior (F00 test harness, test anchors), Balthasar (F23a/F23b split, F37 validation, F36 storage), Caspar (feature merges, phased delivery).",
    "published_package": "@serenichron/mcp-cloudron v0.1.0",
    "npm_url": "https://www.npmjs.com/package/@serenichron/mcp-cloudron",
    "github_url": "https://github.com/serenichron/mcp-cloudron",
    "existing_tools": [
      "cloudron_list_apps - List all installed applications",
      "cloudron_get_app - Get app details by ID",
      "cloudron_get_status - Get Cloudron instance status"
    ],
    "magi_consensus": {
      "melchior_strategic": [
        "F00 test harness as BLOCKING dependency for ALL features",
        "Strengthened test anchors with specific assertions per feature",
        "Test-first development pattern (automated Jest tests, not manual)"
      ],
      "balthasar_safety": [
        "F23 split into F23a (validate_manifest) + F23b (install_app) for two-phase safety",
        "F37 (validate_operation) pre-flight validation for destructive operations",
        "F36 (check_storage) pre-flight validation for data-creating operations",
        "Hardened dependencies: F04\u2192F37, F08\u2192F36, F23b\u2192F23a+F36"
      ],
      "caspar_pragmatic": [
        "Merged F01/F02/F03 into single cloudron_control_app with action enum",
        "Merged F06/F30 into single cloudron_get_logs with type enum",
        "Merged F13/F15 into single cloudron_create_user with role parameter",
        "Prioritized 10 MVP features (Phase 1) for 200-300 min total effort",
        "Deferred 23 features to Phase 2 after MVP proves value"
      ]
    },
    "api_endpoints": [
      "GET /api/v1/apps - List applications",
      "GET /api/v1/apps/:id - Get app by ID",
      "GET /api/v1/cloudron/status - Get instance status",
      "POST /api/v1/apps/:id/start - Start app (F01)",
      "POST /api/v1/apps/:id/stop - Stop app (F01)",
      "POST /api/v1/apps/:id/restart - Restart app (F01)",
      "DELETE /api/v1/apps/:id - Uninstall app (F04)",
      "PUT /api/v1/apps/:id/configure - Configure app (F05)",
      "GET /api/v1/apps/:id/logs - Get app logs (F06)",
      "GET /api/v1/services/:id/logs - Get service logs (F06)",
      "GET /api/v1/backups - List backups (F07)",
      "POST /api/v1/backups - Create backup (F08)",
      "GET /api/v1/users - List users (F12)",
      "POST /api/v1/users - Create user (F13)",
      "GET /api/v1/appstore - Search app store (F22)",
      "POST /api/v1/apps - Install app (F23b)",
      "GET /api/v1/tasks/:id - Get task status (F34)",
      "DELETE /api/v1/tasks/:id - Cancel task (F35)"
    ],
    "external_dependencies": [
      "@modelcontextprotocol/sdk v1.24.3 - MCP protocol implementation",
      "node-fetch - HTTP client for Cloudron API",
      "TypeScript 5.9.3 - Type safety and compilation",
      "jest v29.x - Testing framework (NEW)",
      "@types/jest - TypeScript types for Jest (NEW)",
      "ts-jest - TypeScript preprocessor for Jest (NEW)"
    ],
    "environment_variables": [
      "CLOUDRON_BASE_URL - Cloudron instance URL (required for production, mocked in tests)",
      "CLOUDRON_API_TOKEN - API token with read/write permissions (required for production, mocked in tests)"
    ],
    "known_issues": [],
    "phased_delivery": {
      "phase_0": {
        "features": 1,
        "effort_estimate": "40-60 minutes",
        "blocking": true,
        "description": "F00 test harness foundation"
      },
      "phase_1": {
        "features": 14,
        "effort_estimate": "200-300 minutes total (14-21 minutes per feature average)",
        "description": "MVP features + safety infrastructure (F01, F04, F05, F22, F23a, F23b, F07, F08, F12, F13, F06, F34, F35, F36, F37)"
      },
      "phase_2": {
        "features": 20,
        "effort_estimate": "TBD after Phase 1 completion",
        "description": "Deferred features (F09, F11, F14, F16-F21, F24-F29, F31-F33)"
      }
    }
  }
}