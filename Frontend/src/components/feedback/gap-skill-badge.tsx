import { Check, AlertCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GapSkillBadgeProps {
  skillName: string;
  type?: 'found' | 'gap';
  variant?: 'badge' | 'row';
  demandPercentage?: number;
  onExplore?: () => void;
  className?: string;
}

export function GapSkillBadge({
  skillName,
  type = 'found',
  variant = 'badge',
  demandPercentage,
  onExplore,
  className,
}: GapSkillBadgeProps) {
  const isFound = type === 'found';

  if (variant === 'row') {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-colors hover:border-slate-300 select-none',
          className,
        )}
        data-testid="gap-skill-row"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg',
              isFound
                ? 'bg-emerald-100 text-brand-emerald'
                : 'bg-amber-100 text-amber-700',
            )}
            data-testid="gap-skill-icon"
          >
            {isFound ? (
              <Check size={16} className="stroke-[3]" />
            ) : (
              <AlertCircle size={16} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-brand-midnight">
              {skillName}
            </span>
            {demandPercentage !== undefined && (
              <span className="text-xs text-slate-500">
                Requisitado em {demandPercentage}% das vagas
              </span>
            )}
          </div>
        </div>

        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-blue hover:bg-sky-50 focus:outline-none cursor-pointer"
            data-testid="gap-skill-explore-btn"
          >
            <span>Ver na Trilha</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // Compact badge variant
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold font-sans select-none',
        isFound
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-amber-50 text-amber-800 border-amber-200',
        className,
      )}
      data-testid="gap-skill-badge"
    >
      {isFound ? (
        <Check size={13} className="text-emerald-700 stroke-[3]" />
      ) : (
        <AlertCircle size={13} className="text-amber-700" />
      )}
      <span>{skillName}</span>
    </span>
  );
}
