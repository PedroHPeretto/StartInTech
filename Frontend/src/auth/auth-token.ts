import {
  clearStoredSession,
  readStoredSession,
} from '@/auth/auth-session-storage';

let accessToken: string | null = null;

type SessionUnauthorizedListener = () => void;
const unauthorizedListeners = new Set<SessionUnauthorizedListener>();

const storedSession = readStoredSession();
if (storedSession) {
  accessToken = storedSession.accessToken;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function onSessionUnauthorized(
  listener: SessionUnauthorizedListener,
): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function notifySessionUnauthorized(): void {
  clearStoredSession();
  accessToken = null;
  for (const listener of unauthorizedListeners) {
    listener();
  }
}
