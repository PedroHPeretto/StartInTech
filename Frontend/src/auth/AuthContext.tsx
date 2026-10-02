import type {
  AuthResponseDto,
  AuthUserDto,
  ProfileResponseDto,
} from '@startintech/shared';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { setAccessToken } from '@/auth/auth-token';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profile, setProfile] = useState<SessionProfile | null>(null);

  const setSession = useCallback((response: AuthResponseDto) => {
    setAccessToken(response.accessToken);
    setUser(response.user);
    setIsProfileComplete(response.isProfileComplete);
    setProfile(null);
  }, []);

  const completeProfile = useCallback((response: ProfileResponseDto) => {
    setProfile(toSessionProfile(response));
    setIsProfileComplete(true);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setIsProfileComplete(false);
    setProfile(null);
  }, []);

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
