import { cn } from '@/lib/utils';

export type AtsVerdictType = 'excellent' | 'recommended' | 'attention';

export interface AtsVerdictBadgeProps {
  verdict: AtsVerdictType;
  className?: string;
}

export function AtsVerdictBadge({ verdict, className }: AtsVerdictBadgeProps) {
  const config = {
    excellent: {
      label: 'EXCELENTE COMPATIBILIDADE',
      container:
        'bg-sky-50 text-sky-800 border-sky-300 font-extrabold tracking-wider text-[11px] uppercase py-1 px-3',
      dot: null,
    },
    recommended: {
      label: 'Altamente Recomendado',
      container:
        'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold text-xs py-1 px-3',
      dot: 'bg-emerald-500',
    },
    attention: {
      label: 'Atenção Necessária',
      container:
        'bg-amber-50 text-amber-800 border-amber-200 font-semibold text-xs py-1 px-3',
      dot: 'bg-amber-500',
    },
  }[verdict];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border shadow-2xs select-none',
        config.container,
        className,
      )}
      data-testid="ats-verdict-badge"
    >
      {config.dot && (
        <span
          className={cn('size-2 rounded-full', config.dot)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
