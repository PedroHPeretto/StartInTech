import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_SESSION_STORAGE_KEY,
  writeStoredSession,
} from '@/auth/auth-session-storage';
import { getAccessToken, setAccessToken } from '@/auth/auth-token';
import { apiClient } from '@/lib/api-client';

describe('apiClient Authorization header', () => {
  afterEach(() => {
    setAccessToken(null);
    vi.unstubAllGlobals();
  });

  it('adds Bearer token when access token is set', async () => {
    setAccessToken('test-jwt-token');

    const request = apiClient.interceptors.request.handlers?.[0]?.fulfilled;
    if (!request) {
      throw new Error('Expected apiClient request interceptor');
    }

    const config = await request({
      headers: axios.AxiosHeaders.from({}),
    });

    expect(config.headers.Authorization).toBe('Bearer test-jwt-token');
  });

  it('omits Authorization when no token is set', async () => {
    const request = apiClient.interceptors.request.handlers?.[0]?.fulfilled;
    if (!request) {
      throw new Error('Expected apiClient request interceptor');
    }

    const config = await request({
      headers: axios.AxiosHeaders.from({}),
    });

    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('apiClient 401 handling', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  afterEach(() => {
    setAccessToken(null);
    vi.unstubAllGlobals();
  });

  it('clears the session on 401 when Authorization was sent', async () => {
    setAccessToken('stored-token');
    writeStoredSession({
      accessToken: 'stored-token',
      user: { id: 'u1', email: 'a@b.com' },
      isProfileComplete: true,
      profile: null,
    });

    const rejected = apiClient.interceptors.response.handlers?.[0]?.rejected;
    if (!rejected) {
      throw new Error('Expected apiClient response interceptor');
    }

    await expect(
      rejected({
        isAxiosError: true,
        response: { status: 401 },
        config: {
          headers: axios.AxiosHeaders.from({
            Authorization: 'Bearer stored-token',
          }),
        },
      }),
    ).rejects.toBeDefined();

    expect(getAccessToken()).toBeNull();
    expect(store[AUTH_SESSION_STORAGE_KEY]).toBeUndefined();
  });

  it('does not clear the session on 401 without Authorization', async () => {
    setAccessToken('stored-token');
    writeStoredSession({
      accessToken: 'stored-token',
      user: { id: 'u1', email: 'a@b.com' },
      isProfileComplete: true,
      profile: null,
    });

    const rejected = apiClient.interceptors.response.handlers?.[0]?.rejected;
    if (!rejected) {
      throw new Error('Expected apiClient response interceptor');
    }

    await expect(
      rejected({
        isAxiosError: true,
        response: { status: 401 },
        config: {
          headers: axios.AxiosHeaders.from({}),
        },
      }),
    ).rejects.toBeDefined();

    expect(getAccessToken()).toBe('stored-token');
    expect(store[AUTH_SESSION_STORAGE_KEY]).toBeDefined();
  });
});
