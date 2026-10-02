import axios from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { setAccessToken } from '@/auth/auth-token';
import { apiClient } from '@/lib/api-client';

describe('apiClient Authorization header', () => {
  afterEach(() => {
    setAccessToken(null);
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
