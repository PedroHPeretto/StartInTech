import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AlertBannerProps {
  message: string;
  variant?: 'info' | 'warning' | 'success';
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  message,
  variant = 'info',
  actionLabel,
  onAction,
  onDismiss,
  className,
}: AlertBannerProps) {
  const variantConfig = {
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-950',
      icon: <Info className="size-5 shrink-0 text-brand-blue" />,
      btnVariant: 'default' as const,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-950',
      icon: <AlertTriangle className="size-5 shrink-0 text-amber-600" />,
      btnVariant: 'secondary' as const,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      icon: <CheckCircle2 className="size-5 shrink-0 text-brand-emerald" />,
      btnVariant: 'default' as const,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      role="status"
      className={cn(
        'flex w-full flex-col gap-3 rounded-2xl border p-4 shadow-2xs transition-all select-none sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5',
        config.container,
        className,
      )}
      data-testid="alert-banner"
    >
      <div className="flex items-center gap-3">
        {config.icon}
        <p className="text-xs sm:text-sm font-sans font-medium leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2.5 shrink-0">
        {actionLabel && onAction && (
          <Button
            size="sm"
            onClick={onAction}
            className="text-xs font-semibold"
            data-testid="alert-banner-action-btn"
          >
            {actionLabel}
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex size-7 items-center justify-center rounded-lg text-slate-500 hover:bg-black/5 hover:text-slate-800 focus:outline-none"
            aria-label="Dispensar aviso"
            data-testid="alert-banner-dismiss-btn"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
