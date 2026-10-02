import type {
  AuthResponseDto,
  AuthUserDto,
  ProfileResponseDto,
} from '@startintech/shared';
import { createContext } from 'react';

export interface SessionProfile {
  fullName: string;
  careerTrack: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AuthContextValue {
  user: AuthUserDto | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  profile: SessionProfile | null;
  setSession: (response: AuthResponseDto) => void;
  completeProfile: (profile: ProfileResponseDto) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
