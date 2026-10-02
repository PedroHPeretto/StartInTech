import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context-state';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
