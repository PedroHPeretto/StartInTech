export type PostAuthRoute = '/onboarding' | '/dashboard';

export function getPostAuthRoute(isProfileComplete: boolean): PostAuthRoute {
  return isProfileComplete ? '/dashboard' : '/onboarding';
}
