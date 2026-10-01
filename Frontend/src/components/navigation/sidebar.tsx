import {
  LayoutDashboard,
  Briefcase,
  Map,
  FileText,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { BrandHeader } from '@/components/brand/brand-header';
import { MenuItem } from '@/components/navigation/menu-item';
import { UserAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  user?: UserInfo;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  navItems?: NavItemConfig[];
}

const defaultNavItems: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'jobs', label: 'Vagas', icon: <Briefcase size={20} />, badge: 24 },
  { id: 'roadmaps', label: 'Trilhas de Carreira', icon: <Map size={20} /> },
  { id: 'resume', label: 'Meu Currículo', icon: <FileText size={20} /> },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];

export function Sidebar({
  activeRoute,
  onNavigate,
  user,
  onLogout,
  isOpen = false,
  onClose,
  className,
  navItems = defaultNavItems,
}: SidebarProps) {
  const sidebarContent = (
    <aside
      className={cn(
        'bg-brand-midnight flex h-full w-[280px] shrink-0 flex-col justify-between p-6 text-white select-none',
        className,
      )}
      data-testid="sidebar"
    >
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <BrandHeader theme="dark" showTagline={false} />
          {/* Mobile close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Fechar menu"
              data-testid="sidebar-close-btn"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav
          className="flex flex-col gap-1.5"
          aria-label="Navegação principal"
          data-testid="sidebar-nav"
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              isActive={activeRoute === item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Section: User & Logout */}
      <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-5">
        {user && (
          <div
            className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
            data-testid="sidebar-user"
          >
            <UserAvatar
              name={user.name}
              src={user.avatarUrl}
              size="sm"
              status="online"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-white">
                {user.name}
              </span>
              <span className="truncate text-[11px] text-slate-400">
                {user.email}
              </span>
            </div>
          </div>
        )}

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            data-testid="sidebar-logout-btn"
          >
            <LogOut size={16} />
            <span>Sair da conta</span>
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile / Tablet Overlay Drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
          data-testid="sidebar-mobile-drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer content */}
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
