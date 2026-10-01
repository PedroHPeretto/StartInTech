import logoSvg from '@/assets/icons/logo.svg';
import { cn } from '@/lib/utils';

export interface BrandHeaderProps {
  variant?: 'default' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark';
  className?: string;
  href?: string;
  showTagline?: boolean;
}

export function BrandHeader({
  variant = 'default',
  theme = 'light',
  className,
  href = '/',
  showTagline = false,
}: BrandHeaderProps) {
  const isDark = theme === 'dark';
  const isIconOnly = variant === 'icon-only';
  const isCompact = variant === 'compact';

  const content = (
    <div
      className={cn(
        'inline-flex items-center gap-3 transition-opacity hover:opacity-95',
        className,
      )}
      data-testid="brand-header"
    >
      {/* Logo Badge */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl shadow-xs transition-transform',
          isCompact ? 'size-8 rounded-lg' : 'size-10',
          isDark ? 'bg-white' : 'bg-white',
        )}
        data-testid="brand-logo-badge"
      >
        <img
          src={logoSvg}
          alt="StartInTech"
          className={cn(
            'shrink-0 select-none object-contain',
            isCompact ? 'size-5' : 'size-6',
          )}
        />
      </div>

      {/* Brand Text */}
      {!isIconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center font-heading font-bold tracking-tight select-none">
            <span
              className={cn(
                'text-brand-midnight transition-colors',
                isCompact ? 'text-lg' : 'text-xl',
                isDark && 'text-white',
              )}
            >
              StartIn
            </span>
            <span
              className={cn(
                'text-brand-blue transition-colors',
                isCompact ? 'text-lg' : 'text-xl',
                isDark && 'text-sky-400',
              )}
            >
              Tech
            </span>
          </div>
          {showTagline && !isCompact && (
            <span
              className={cn(
                'text-[11px] font-sans font-medium transition-colors',
                isDark ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              Acelere sua carreira em TI
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="focus-visible:ring-primary inline-flex rounded-lg outline-none focus-visible:ring-2"
        aria-label="StartInTech Início"
      >
        {content}
      </a>
    );
  }

  return content;
}
