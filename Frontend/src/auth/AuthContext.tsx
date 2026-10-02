import type { AuthResponseDto, AuthUserDto } from '@startintech/shared';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { setAccessToken } from '@/auth/auth-token';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context-state';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const setSession = useCallback((response: AuthResponseDto) => {
    setAccessToken(response.accessToken);
    setUser(response.user);
    setIsProfileComplete(response.isProfileComplete);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setIsProfileComplete(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isProfileComplete,
      setSession,
      clearSession,
    }),
    [user, isProfileComplete, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
