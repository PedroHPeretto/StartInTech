import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { DashboardPage } from '@/pages/dashboard-page';
import { LoginPage } from '@/pages/login-page';
import { OnboardingPage } from '@/pages/onboarding-page';
import type { RouterContext } from '@/routes/router-context';
import { getPostAuthRoute } from '@/auth/redirect-after-auth';

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    throw redirect({ to: getPostAuthRoute(auth.isProfileComplete) });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (auth.isAuthenticated) {
      throw redirect({ to: getPostAuthRoute(auth.isProfileComplete) });
    }
  },
  component: LoginPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (auth.isProfileComplete) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: OnboardingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!auth.isProfileComplete) {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  onboardingRoute,
  dashboardRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
