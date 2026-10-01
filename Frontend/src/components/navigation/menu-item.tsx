import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface MenuItemProps {
  icon: ReactNode;
  label: string;
  badge?: string | number;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function MenuItem({
  icon,
  label,
  badge,
  isActive = false,
  href,
  onClick,
  collapsed = false,
  className,
}: MenuItemProps) {
  const content = (
    <div
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-sans font-medium transition-all select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
        collapsed ? 'justify-center px-2.5' : 'justify-between',
        isActive
          ? 'bg-brand-blue text-white shadow-xs font-semibold'
          : 'text-slate-300 hover:bg-white/10 hover:text-white',
        className,
      )}
      data-testid="menu-item"
      title={collapsed ? label : undefined}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
          )}
          data-testid="menu-item-icon"
        >
          {icon}
        </span>
        {!collapsed && <span className="truncate">{label}</span>}
      </div>

      {!collapsed && badge !== undefined && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-slate-300 group-hover:bg-white/20',
          )}
          data-testid="menu-item-badge"
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block outline-none" onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left outline-none"
    >
      {content}
    </button>
  );
}
