import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { DashboardPage } from '@/pages/dashboard-page';
import { CurriculumAnalysisPage } from '@/pages/curriculum-analysis-page';
import { CurriculumUploadPage } from '@/pages/curriculum-upload-page';
import { LoginPage } from '@/pages/login-page';
import { OnboardingPage } from '@/pages/onboarding-page';
import { JobsPage } from '@/pages/jobs-page';
import { RoadmapPage } from '@/pages/roadmap-page';
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

const curriculumUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/curriculum/upload',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!auth.isProfileComplete) {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: CurriculumUploadPage,
});

const roadmapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/roadmap',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!auth.isProfileComplete) {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: RoadmapPage,
});

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!auth.isProfileComplete) {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: JobsPage,
});

const curriculumAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/curriculum/analysis/$id',
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!auth.isProfileComplete) {
      throw redirect({ to: '/onboarding' });
    }
  },
  component: CurriculumAnalysisPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  onboardingRoute,
  dashboardRoute,
  roadmapRoute,
  jobsRoute,
  curriculumUploadRoute,
  curriculumAnalysisRoute,
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
