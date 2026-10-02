import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_SESSION_STORAGE_KEY,
  clearStoredSession,
  isAccessTokenExpired,
  readStoredSession,
  writeStoredSession,
  type StoredAuthSession,
} from '@/auth/auth-session-storage';

const baseSession: StoredAuthSession = {
  accessToken: 'e2e-access-token',
  user: { id: 'user-1', email: 'user@example.com' },
  isProfileComplete: true,
  profile: null,
};

function makeJwtWithExp(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.signature`;
}

describe('auth-session-storage', () => {
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
    vi.unstubAllGlobals();
  });

  it('round-trips a stored session', () => {
    writeStoredSession(baseSession);
    expect(readStoredSession()).toEqual(baseSession);
  });

  it('clears corrupt JSON and returns null', () => {
    store[AUTH_SESSION_STORAGE_KEY] = '{not-json';
    expect(readStoredSession()).toBeNull();
    expect(store[AUTH_SESSION_STORAGE_KEY]).toBeUndefined();
  });

  it('discards expired JWT sessions', () => {
    const expiredToken = makeJwtWithExp(Math.floor(Date.now() / 1000) - 60);
    writeStoredSession({ ...baseSession, accessToken: expiredToken });
    expect(readStoredSession()).toBeNull();
    expect(store[AUTH_SESSION_STORAGE_KEY]).toBeUndefined();
  });

  it('keeps opaque tokens without exp claim', () => {
    writeStoredSession(baseSession);
    expect(readStoredSession()).toEqual(baseSession);
    expect(isAccessTokenExpired('e2e-access-token')).toBe(false);
  });

  it('clearStoredSession removes the key', () => {
    writeStoredSession(baseSession);
    clearStoredSession();
    expect(readStoredSession()).toBeNull();
  });
});
