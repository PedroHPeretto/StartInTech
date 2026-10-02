import type { AuthUserDto } from '@startintech/shared';
import type { SessionProfile } from '@/auth/auth-context-state';

export const AUTH_SESSION_STORAGE_KEY = 'startintech.auth';

export interface StoredAuthSession {
  accessToken: string;
  user: AuthUserDto;
  isProfileComplete: boolean;
  profile: SessionProfile | null;
}

function canUseLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as StoredAuthSession;
  return (
    typeof session.accessToken === 'string' &&
    session.user !== null &&
    typeof session.user === 'object' &&
    typeof session.user.id === 'string' &&
    typeof session.user.email === 'string' &&
    typeof session.isProfileComplete === 'boolean' &&
    (session.profile === null || typeof session.profile === 'object')
  );
}

export function readStoredSession(): StoredAuthSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredAuthSession(parsed)) {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }

    if (isAccessTokenExpired(parsed.accessToken)) {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    try {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

export function writeStoredSession(session: StoredAuthSession): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore quota / privacy errors
  }
}

export function clearStoredSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
