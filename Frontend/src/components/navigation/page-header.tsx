import { Menu, Bell } from 'lucide-react';
import { BrandHeader } from '@/components/brand/brand-header';
import { SearchBar } from '@/components/ui/search-bar';
import { UserAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  userName?: string;
  userAvatar?: string;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onMenuClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  className?: string;
}

export function PageHeader({
  userName = 'Gabriel',
  userAvatar,
  title,
  subtitle,
  showSearch = true,
  searchValue,
  onSearchChange,
  onMenuClick,
  notificationCount = 0,
  onNotificationClick,
  className,
}: PageHeaderProps) {
  const displayTitle = title ?? `Olá, ${userName}!`;
  const displaySubtitle =
    subtitle ?? 'Pronto para acelerar sua carreira em TI hoje?';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-8',
        className,
      )}
      data-testid="page-header"
    >
      {/* Left: Mobile Menu Trigger + Brand or Desktop Greeting */}
      <div className="flex items-center gap-3 md:gap-6">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Abrir menu lateral"
            data-testid="page-header-menu-btn"
          >
            <Menu size={22} />
          </button>
        )}

        {/* Brand for mobile/tablet */}
        <div className="lg:hidden">
          <BrandHeader variant="compact" />
        </div>

        {/* Greeting for desktop */}
        <div className="hidden lg:flex flex-col">
          <h1
            className="text-brand-midnight font-heading text-xl font-bold tracking-tight"
            data-testid="page-header-title"
          >
            {displayTitle}
          </h1>
          <p className="text-xs font-sans text-slate-500">{displaySubtitle}</p>
        </div>
      </div>

      {/* Center: Search Bar */}
      {showSearch && (
        <div className="hidden md:block w-full max-w-md mx-4">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Buscar vagas, trilhas ou competências..."
          />
        </div>
      )}

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={onNotificationClick}
          className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-blue outline-none"
          aria-label="Notificações"
          data-testid="page-header-bell"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white ring-2 ring-white"
              data-testid="page-header-bell-badge"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div
          className="flex items-center gap-2.5 pl-2"
          data-testid="page-header-user-info"
        >
          <UserAvatar
            name={userName}
            src={userAvatar}
            size="md"
            status="online"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-brand-midnight">
              {userName}
            </span>
            <span className="text-[11px] text-slate-400">Estudante</span>
          </div>
        </div>
      </div>
    </header>
  );
}
