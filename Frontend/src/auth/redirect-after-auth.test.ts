import { describe, expect, it } from 'vitest';
import { getPostAuthRoute } from '@/auth/redirect-after-auth';

describe('getPostAuthRoute', () => {
  it('redirects incomplete profiles to onboarding', () => {
    expect(getPostAuthRoute(false)).toBe('/onboarding');
  });

  it('redirects complete profiles to dashboard', () => {
    expect(getPostAuthRoute(true)).toBe('/dashboard');
  });
});
