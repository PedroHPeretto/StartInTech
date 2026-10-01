import { cn } from '@/lib/utils';

export type PriorityLevel = 'high' | 'medium' | 'low' | 'excellent';

export interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = {
    high: {
      label: 'Alta Prioridade',
      classes: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    },
    medium: {
      label: 'Média Prioridade',
      classes: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold',
    },
    low: {
      label: 'Baixa Prioridade',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    excellent: {
      label: 'Excelente',
      classes:
        'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    },
  }[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-sans select-none tracking-tight',
        config.classes,
        className,
      )}
      data-testid="priority-badge"
    >
      {config.label}
    </span>
  );
}
