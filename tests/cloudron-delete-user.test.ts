/**
 * Tests for cloudron_delete_user tool
 * Test anchors:
 * - DELETE /api/v1/users/:userId succeeds with 204 No Content
 * - Empty userId rejects with validation error
 * - 404 Not Found for non-existent user
 * - 401 Unauthorized for invalid token
 * - 403 Forbidden when trying to delete last admin
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CloudronClient } from '../src/cloudron-client.js';
import { mockSuccessResponse, mockErrorResponse } from './helpers/cloudron-mock.js';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockBaseUrl = 'https://cloudron.example.com';
const mockToken = 'test-token-123';

describe('cloudron_delete_user', () => {
  let client: CloudronClient;

  beforeEach(() => {
    client = new CloudronClient({ baseUrl: mockBaseUrl, token: mockToken });
    jest.clearAllMocks();
  });

  describe('Input validation', () => {
    it('should throw on empty userId', async () => {
      await expect(client.deleteUser('')).rejects.toThrow();
    });

    it('should throw on whitespace userId', async () => {
      await expect(client.deleteUser('   ')).rejects.toThrow();
    });
  });

  describe('Successful deletion', () => {
    it('should resolve without error on successful delete', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 204,
          statusText: 'No Content',
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(null),
          text: () => Promise.resolve(''),
        } as unknown as Response
      );

      await expect(client.deleteUser('user-123')).resolves.toBeUndefined();
    });

    it('should call DELETE /api/v1/users/:id', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 204,
          statusText: 'No Content',
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(null),
          text: () => Promise.resolve(''),
        } as unknown as Response
      );

      await client.deleteUser('user-abc');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/user-abc'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should include Authorization header', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 204,
          statusText: 'No Content',
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(null),
          text: () => Promise.resolve(''),
        } as unknown as Response
      );

      await client.deleteUser('user-xyz');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw on 404 Not Found', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        mockErrorResponse(404, 'User not found')
      );

      await expect(client.deleteUser('no-such-user')).rejects.toThrow('User not found');
    });

    it('should throw on 401 Unauthorized', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        mockErrorResponse(401, 'Invalid token')
      );

      await expect(client.deleteUser('user-123')).rejects.toThrow('Invalid token');
    });

    it('should throw on 403 Forbidden', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        mockErrorResponse(403, 'Cannot delete last admin user')
      );

      await expect(client.deleteUser('admin-1')).rejects.toThrow();
    });

    it('should throw on 500 Internal Server Error', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        mockErrorResponse(500, 'Internal server error')
      );

      await expect(client.deleteUser('user-123')).rejects.toThrow();
    });
  });
});
