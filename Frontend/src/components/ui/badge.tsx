import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium font-sans transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60',
        secondary:
          'bg-slate-200/80 text-slate-800 hover:bg-slate-300 border border-transparent',
        outline:
          'border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50',
        remoto:
          'bg-sky-50 text-sky-700 border border-sky-200 font-semibold hover:bg-sky-100',
        hibrido:
          'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold hover:bg-indigo-100',
        presencial:
          'bg-slate-100 text-slate-700 border border-slate-300 font-semibold hover:bg-slate-200',
        success:
          'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold hover:bg-emerald-100',
        warning:
          'bg-amber-50 text-amber-800 border border-amber-200 font-semibold hover:bg-amber-100',
        destructive:
          'bg-red-50 text-red-800 border border-red-200 font-semibold hover:bg-red-100',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  removable = false,
  onRemove,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      data-testid="badge"
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none"
          aria-label="Remover"
          data-testid="badge-remove-btn"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

export type WorkModeType = 'REMOTE' | 'HYBRID' | 'ON_SITE';

export function WorkModeBadge({
  mode,
  className,
}: {
  mode: WorkModeType;
  className?: string;
}) {
  const modeConfig = {
    REMOTE: { label: 'Remoto', variant: 'remoto' as const },
    HYBRID: { label: 'Híbrido', variant: 'hibrido' as const },
    ON_SITE: { label: 'Presencial', variant: 'presencial' as const },
  };

  const config = modeConfig[mode] ?? modeConfig.REMOTE;

  return (
    <Badge
      variant={config.variant}
      className={cn('tracking-wide uppercase text-[10px]', className)}
      data-testid="work-mode-badge"
    >
      {config.label}
    </Badge>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { badgeVariants };
