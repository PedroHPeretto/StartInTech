import { Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MatchScoreProps {
  score: number;
  variant?: 'badge' | 'metric' | 'compact';
  showIcon?: boolean;
  className?: string;
}

export function MatchScore({
  score,
  variant = 'badge',
  showIcon = true,
  className,
}: MatchScoreProps) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color & status determination per design system
  const isHigh = normalizedScore >= 80;
  const isMedium = normalizedScore >= 50 && normalizedScore < 80;

  const statusConfig = isHigh
    ? {
        label: 'Altamente Compatível',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        textColor: 'text-brand-emerald',
        dotColor: 'bg-brand-emerald',
        icon: <Check size={13} className="text-emerald-700" />,
      }
    : isMedium
      ? {
          label: 'Média Compatibilidade',
          badgeBg: 'bg-sky-50 border-sky-200 text-sky-800',
          textColor: 'text-brand-blue',
          dotColor: 'bg-brand-blue',
          icon: <Sparkles size={13} className="text-brand-blue" />,
        }
      : {
          label: 'Baixa Compatibilidade',
          badgeBg: 'bg-slate-100 border-slate-200 text-slate-700',
          textColor: 'text-slate-600',
          dotColor: 'bg-slate-400',
          icon: null,
        };

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold font-heading select-none',
          statusConfig.badgeBg,
          className,
        )}
        data-testid="match-score-compact"
      >
        {normalizedScore}%
      </span>
    );
  }

  if (variant === 'metric') {
    return (
      <div
        className={cn('flex flex-col select-none', className)}
        data-testid="match-score-metric"
      >
        <div className="flex items-baseline gap-1 font-heading text-3xl font-extrabold text-brand-midnight">
          <span>{normalizedScore}%</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn('size-2 rounded-full', statusConfig.dotColor)}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold text-slate-600">
            {statusConfig.label}
          </span>
        </div>
      </div>
    );
  }

  // Default 'badge' variant
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-sans select-none shadow-2xs',
        statusConfig.badgeBg,
        className,
      )}
      data-testid="match-score-badge"
    >
      {showIcon && statusConfig.icon}
      <span className="font-bold">{normalizedScore}%</span>
      <span className="font-medium text-[11px] opacity-90">Match</span>
    </div>
  );
}

export { MatchScore as MatchBadge };
