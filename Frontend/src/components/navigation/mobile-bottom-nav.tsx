import type { ReactNode } from 'react';
import { LayoutDashboard, Briefcase, Map, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileNavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface MobileBottomNavProps {
  activeItem: string;
  onSelect: (id: string) => void;
  items?: MobileNavItem[];
  className?: string;
  hideOnDesktop?: boolean;
}

const defaultMobileItems: MobileNavItem[] = [
  { id: 'dashboard', label: 'Início', icon: <LayoutDashboard size={20} /> },
  { id: 'jobs', label: 'Vagas', icon: <Briefcase size={20} /> },
  { id: 'roadmaps', label: 'Trilha', icon: <Map size={20} /> },
  { id: 'resume', label: 'Currículo', icon: <FileText size={20} /> },
  { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
];

export function MobileBottomNav({
  activeItem,
  onSelect,
  items = defaultMobileItems,
  className,
  hideOnDesktop = false,
}: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-safe backdrop-blur-md select-none shadow-lg',
        hideOnDesktop && 'lg:hidden',
        className,
      )}
      aria-label="Navegação inferior mobile"
      data-testid="mobile-bottom-nav"
    >
      {items.map((item) => {
        const isActive = item.id === activeItem;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'group relative flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-sans font-medium transition-colors outline-none cursor-pointer',
              isActive
                ? 'text-brand-blue font-semibold'
                : 'text-slate-500 hover:text-slate-800',
            )}
            data-testid={`mobile-nav-${item.id}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active Pill top indicator */}
            {isActive && (
              <span
                className="absolute -top-1.5 h-1 w-8 rounded-full bg-brand-blue animate-in fade-in duration-200"
                data-testid="mobile-nav-active-pill"
              />
            )}
            <span
              className={cn(
                'transition-transform group-active:scale-90',
                isActive && 'scale-105',
              )}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
