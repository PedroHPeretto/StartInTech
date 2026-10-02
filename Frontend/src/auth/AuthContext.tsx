import type {
  AuthResponseDto,
  AuthUserDto,
  ProfileResponseDto,
} from '@startintech/shared';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getAccessToken,
  onSessionUnauthorized,
  setAccessToken,
} from '@/auth/auth-token';
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from '@/auth/auth-session-storage';
import {
  AuthContext,
  type AuthContextValue,
  type SessionProfile,
} from '@/auth/auth-context-state';

function toSessionProfile(profile: ProfileResponseDto): SessionProfile {
  return {
    fullName: profile.fullName,
    careerTrack: {
      id: profile.careerTrack.id,
      name: profile.careerTrack.name,
      slug: profile.careerTrack.slug,
    },
  };
}

function getInitialAuthState(): {
  user: AuthUserDto | null;
  isProfileComplete: boolean;
  profile: SessionProfile | null;
} {
  const stored = readStoredSession();
  if (!stored) {
    return { user: null, isProfileComplete: false, profile: null };
  }

  setAccessToken(stored.accessToken);
  return {
    user: stored.user,
    isProfileComplete: stored.isProfileComplete,
    profile: stored.profile,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(
    () => getInitialAuthState().user,
  );
  const [isProfileComplete, setIsProfileComplete] = useState(
    () => getInitialAuthState().isProfileComplete,
  );
  const [profile, setProfile] = useState<SessionProfile | null>(
    () => getInitialAuthState().profile,
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    clearStoredSession();
    setUser(null);
    setIsProfileComplete(false);
    setProfile(null);
  }, []);

  useEffect(() => {
    return onSessionUnauthorized(() => {
      setUser(null);
      setIsProfileComplete(false);
      setProfile(null);
    });
  }, []);

  const setSession = useCallback((response: AuthResponseDto) => {
    setAccessToken(response.accessToken);
    setUser(response.user);
    setIsProfileComplete(response.isProfileComplete);
    setProfile(null);
    writeStoredSession({
      accessToken: response.accessToken,
      user: response.user,
      isProfileComplete: response.isProfileComplete,
      profile: null,
    });
  }, []);

  const completeProfile = useCallback(
    (response: ProfileResponseDto) => {
      const sessionProfile = toSessionProfile(response);
      setProfile(sessionProfile);
      setIsProfileComplete(true);
      const token = getAccessToken();
      if (!user || !token) {
        return;
      }
      writeStoredSession({
        accessToken: token,
        user,
        isProfileComplete: true,
        profile: sessionProfile,
      });
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isProfileComplete,
      profile,
      setSession,
      completeProfile,
      clearSession,
    }),
    [
      user,
      isProfileComplete,
      profile,
      setSession,
      completeProfile,
      clearSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
