export const NAV_ROUTE_BY_ID = {
  dashboard: '/dashboard',
  roadmaps: '/roadmap',
  resume: '/curriculum/upload',
} as const;

export type AppNavId = keyof typeof NAV_ROUTE_BY_ID;

export type AppNavRoute = (typeof NAV_ROUTE_BY_ID)[AppNavId];

export function resolveActiveNavId(pathname: string): AppNavId | '' {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return 'dashboard';
  }
  if (pathname === '/roadmap' || pathname.startsWith('/roadmap/')) {
    return 'roadmaps';
  }
  if (pathname === '/curriculum' || pathname.startsWith('/curriculum/')) {
    return 'resume';
  }
  return '';
}

export function navRouteFor(id: string): AppNavRoute | null {
  if (id === 'dashboard' || id === 'roadmaps' || id === 'resume') {
    return NAV_ROUTE_BY_ID[id];
  }
  return null;
}
