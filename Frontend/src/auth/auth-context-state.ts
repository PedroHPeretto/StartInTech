import type { AuthResponseDto, AuthUserDto } from '@startintech/shared';
import { createContext } from 'react';

export interface AuthContextValue {
  user: AuthUserDto | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  setSession: (response: AuthResponseDto) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
