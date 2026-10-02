import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { FileText, LayoutDashboard, Map } from 'lucide-react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from '@/auth/use-auth';
import {
  navRouteFor,
  resolveActiveNavId,
} from '@/components/navigation/app-nav';
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav';
import { PageFooter } from '@/components/navigation/page-footer';
import { PageHeader } from '@/components/navigation/page-header';
import { Sidebar, type NavItemConfig } from '@/components/navigation/sidebar';

const appNavItems: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: 'roadmaps',
    label: 'Trilhas de Carreira',
    icon: <Map size={20} />,
  },
  {
    id: 'resume',
    label: 'Meu Currículo',
    icon: <FileText size={20} />,
  },
];

const mobileNavItems = [
  { id: 'dashboard', label: 'Início', icon: <LayoutDashboard size={20} /> },
  { id: 'roadmaps', label: 'Trilha', icon: <Map size={20} /> },
  { id: 'resume', label: 'Currículo', icon: <FileText size={20} /> },
];

export function AppShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { user, profile, clearSession } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const displayName = profile?.fullName?.trim() || user?.email || 'Estudante';
  const activeRoute = resolveActiveNavId(pathname);

  const handleNavigate = (id: string) => {
    const to = navRouteFor(id);
    if (!to) {
      return;
    }
    void navigate({ to });
  };

  const handleLogout = () => {
    flushSync(() => {
      clearSession();
    });
    void navigate({ to: '/login' });
  };

  return (
    <div
      className="flex min-h-screen bg-brand-light-gray"
      data-testid="app-shell"
    >
      <Sidebar
        activeRoute={activeRoute}
        navItems={appNavItems}
        onNavigate={handleNavigate}
        user={
          user
            ? {
                name: displayName,
                email: user.email,
              }
            : undefined
        }
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <PageHeader
          userName={displayName}
          showSearch={false}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
        <PageFooter />
      </div>

      <MobileBottomNav
        activeItem={activeRoute}
        items={mobileNavItems}
        onSelect={handleNavigate}
        hideOnDesktop
      />
    </div>
  );
}
