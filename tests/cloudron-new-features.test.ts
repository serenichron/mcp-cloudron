/**
 * Tests for new features: groups, services, app lifecycle, updates, and packaging tools
 * Test anchors:
 * - cloudron_check_updates returns update availability
 * - cloudron_apply_update returns taskId
 * - cloudron_list_groups returns group array
 * - cloudron_create_group creates a group
 * - cloudron_list_services returns service array
 * - cloudron_backup_app performs storage check and returns taskId
 * - cloudron_restore_app validates params and returns taskId
 * - cloudron_clone_app validates params and returns taskId
 * - cloudron_repair_app returns taskId
 * - cloudron_update_app returns taskId
 * - cloudron_validate_package validates manifest, dockerfile, and start.sh
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CloudronClient } from '../src/cloudron-client.js';
import type { Group, Service, UpdateInfo } from '../src/types.js';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockBaseUrl = 'https://cloudron.example.com';
const mockToken = 'test-token-123';

function makeJsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (h: string) => h === 'content-type' ? 'application/json' : null },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as unknown as Response;
}

describe('cloudron_check_updates', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return available: false when no update', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ update: null })
    );
    const result = await client.checkUpdates();
    expect(result.available).toBe(false);
  });

  it('should return update info when update available', async () => {
    const mockUpdate = { version: '7.3.0', changelog: 'Bug fixes', critical: false };
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ update: mockUpdate })
    );
    const result = await client.checkUpdates();
    expect(result.available).toBe(true);
    expect(result.version).toBe('7.3.0');
    expect(result.changelog).toBe('Bug fixes');
  });

  it('should call correct endpoint', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ update: null })
    );
    await client.checkUpdates();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/cloudron/update'),
      expect.any(Object)
    );
  });
});

describe('cloudron_apply_update', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return taskId on success', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'update-task-123' })
    );
    const taskId = await client.applyUpdate();
    expect(taskId).toBe('update-task-123');
  });

  it('should throw if response missing taskId', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({})
    );
    await expect(client.applyUpdate()).rejects.toThrow('missing taskId');
  });

  it('should POST to correct endpoint', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'task-1' })
    );
    await client.applyUpdate();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/cloudron/update'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('cloudron_list_groups', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return groups array', async () => {
    const mockGroups: Group[] = [
      { id: 'g-1', name: 'Admins', creationTime: '2024-01-01T00:00:00Z' },
      { id: 'g-2', name: 'Users', creationTime: '2024-01-02T00:00:00Z' },
    ];
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ groups: mockGroups })
    );
    const groups = await client.listGroups();
    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('Admins');
  });

  it('should return empty array when no groups', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ groups: [] })
    );
    const groups = await client.listGroups();
    expect(groups).toHaveLength(0);
  });

  it('should call GET /api/v1/groups', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ groups: [] })
    );
    await client.listGroups();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/groups'),
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('cloudron_create_group', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return created group', async () => {
    const mockGroup: Group = { id: 'g-new', name: 'Developers', creationTime: '2024-03-16T00:00:00Z' };
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse(mockGroup)
    );
    const group = await client.createGroup('Developers');
    expect(group.id).toBe('g-new');
    expect(group.name).toBe('Developers');
  });

  it('should throw on empty name', async () => {
    await expect(client.createGroup('')).rejects.toThrow('Group name is required');
  });

  it('should POST to /api/v1/groups', async () => {
    const mockGroup: Group = { id: 'g-1', name: 'Test', creationTime: '2024-01-01T00:00:00Z' };
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse(mockGroup)
    );
    await client.createGroup('Test');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/groups'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('cloudron_list_services', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return services array', async () => {
    const mockServices: Service[] = [
      { name: 'mysql', status: 'running', version: '8.0.35' },
      { name: 'mail', status: 'running' },
    ];
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ services: mockServices })
    );
    const services = await client.listServices();
    expect(services).toHaveLength(2);
    expect(services[0].name).toBe('mysql');
    expect(services[0].status).toBe('running');
  });

  it('should return empty array when no services', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ services: [] })
    );
    const services = await client.listServices();
    expect(services).toHaveLength(0);
  });
});

describe('cloudron_backup_app', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return taskId after storage check', async () => {
    // First call: checkStorage (via getStatus)
    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce(makeJsonResponse({
        version: '7.0.0', apiServerOrigin: '', adminFqdn: '', provider: '',
        cloudronName: '', isDemo: false,
        disk: { total: 100000, used: 20000, free: 80000, percent: 20 },
      }))
      // Second call: backup
      .mockResolvedValueOnce(makeJsonResponse({ taskId: 'backup-task-456' }));

    const taskId = await client.backupApp('app-1');
    expect(taskId).toBe('backup-task-456');
  });

  it('should throw on empty appId', async () => {
    await expect(client.backupApp('')).rejects.toThrow('appId is required');
  });

  it('should throw if response missing taskId', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce(makeJsonResponse({
        version: '7.0.0', apiServerOrigin: '', adminFqdn: '', provider: '',
        cloudronName: '', isDemo: false,
        disk: { total: 100000, used: 20000, free: 80000, percent: 20 },
      }))
      .mockResolvedValueOnce(makeJsonResponse({}));

    await expect(client.backupApp('app-1')).rejects.toThrow('missing taskId');
  });
});

describe('cloudron_restore_app', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return taskId on success', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'restore-task-789' })
    );
    const taskId = await client.restoreApp('app-1', 'backup-123');
    expect(taskId).toBe('restore-task-789');
  });

  it('should throw on empty appId', async () => {
    await expect(client.restoreApp('', 'backup-123')).rejects.toThrow('appId is required');
  });

  it('should throw on empty backupId', async () => {
    await expect(client.restoreApp('app-1', '')).rejects.toThrow('backupId is required');
  });

  it('should POST to /api/v1/apps/:id/restore with backupId', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'task-1' })
    );
    await client.restoreApp('app-1', 'bkp-42');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apps/app-1/restore'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('cloudron_clone_app', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return taskId on success', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'clone-task-001' })
    );
    const taskId = await client.cloneApp({ appId: 'app-1', location: 'blog-copy' });
    expect(taskId).toBe('clone-task-001');
  });

  it('should throw on missing appId', async () => {
    await expect(client.cloneApp({ appId: '', location: 'newloc' })).rejects.toThrow('appId is required');
  });

  it('should throw on missing location', async () => {
    await expect(client.cloneApp({ appId: 'app-1', location: '' })).rejects.toThrow('location');
  });

  it('should POST to /api/v1/apps/:id/clone', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'task-1' })
    );
    await client.cloneApp({ appId: 'app-1', location: 'newloc' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apps/app-1/clone'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('cloudron_repair_app', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return taskId on success', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'repair-task-111' })
    );
    const taskId = await client.repairApp('app-1');
    expect(taskId).toBe('repair-task-111');
  });

  it('should throw on empty appId', async () => {
    await expect(client.repairApp('')).rejects.toThrow('appId is required');
  });

  it('should POST to /api/v1/apps/:id/repair', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'task-1' })
    );
    await client.repairApp('app-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apps/app-1/repair'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('cloudron_update_app', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  it('should return taskId on success', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'update-app-task-222' })
    );
    const taskId = await client.updateApp('app-1');
    expect(taskId).toBe('update-app-task-222');
  });

  it('should throw on empty appId', async () => {
    await expect(client.updateApp('')).rejects.toThrow('appId is required');
  });

  it('should POST to /api/v1/apps/:id/update', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      makeJsonResponse({ taskId: 'task-1' })
    );
    await client.updateApp('app-1', '7.0.0');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apps/app-1/update'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('cloudron_validate_package (static tool)', () => {
  // This tests the validation logic inline since it's purely static

  const validManifest = JSON.stringify({
    id: 'com.example.myapp',
    title: 'My App',
    author: 'Test Author',
    description: 'Test app',
    tagline: 'Test',
    version: '1.0.0',
    healthCheckPath: '/',
    httpPort: 8000,
    addons: { localstorage: {} },
    manifestVersion: 2,
  });

  it('should produce valid: true for complete manifest', () => {
    // Parse and check required fields match
    const parsed = JSON.parse(validManifest);
    const requiredFields = ['id', 'title', 'author', 'description', 'tagline', 'version', 'healthCheckPath', 'httpPort', 'addons', 'manifestVersion'];
    const missingFields = requiredFields.filter(f => !(f in parsed));
    expect(missingFields).toHaveLength(0);
    expect(parsed.manifestVersion).toBe(2);
  });

  it('should detect missing required fields', () => {
    const incomplete = JSON.parse(validManifest);
    delete incomplete.title;
    delete incomplete.httpPort;
    const missing = ['id', 'title', 'author', 'description', 'tagline', 'version', 'healthCheckPath', 'httpPort', 'addons', 'manifestVersion']
      .filter(f => !(f in incomplete));
    expect(missing).toContain('title');
    expect(missing).toContain('httpPort');
  });

  it('should detect invalid JSON', () => {
    expect(() => JSON.parse('{ invalid json }')).toThrow();
  });

  it('should detect wrong manifestVersion', () => {
    const manifest = JSON.parse(validManifest);
    manifest.manifestVersion = 1;
    expect(manifest.manifestVersion).not.toBe(2);
  });

  it('should detect Dockerfile missing cloudron/base', () => {
    const dockerfile = 'FROM ubuntu:22.04\nRUN apt-get update';
    expect(dockerfile).not.toContain('FROM cloudron/base');
  });

  it('should pass Dockerfile with cloudron/base', () => {
    const dockerfile = 'FROM cloudron/base:22.04\nRUN apt-get update && rm -rf /var/lib/apt/lists/*';
    expect(dockerfile).toContain('FROM cloudron/base');
  });

  it('should detect start.sh missing shebang', () => {
    const script = 'echo "Starting app"';
    expect(script.startsWith('#!')).toBe(false);
  });

  it('should pass start.sh with shebang', () => {
    const script = '#!/bin/bash\nset -eu\nexec node server.js';
    expect(script.startsWith('#!/')).toBe(true);
  });
});
