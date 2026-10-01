import { Check, Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SkillNodeStatus = 'completed' | 'in-progress' | 'locked';

export interface SkillNodeProps {
  id: string;
  title: string;
  status?: SkillNodeStatus;
  category?: string;
  onClick?: (id: string) => void;
  className?: string;
}

export function SkillNode({
  id,
  title,
  status = 'locked',
  category,
  onClick,
  className,
}: SkillNodeProps) {
  const isLocked = status === 'locked';

  const statusConfig = {
    completed: {
      border: 'border-emerald-300 hover:border-emerald-400 bg-white',
      badge: 'bg-emerald-100 text-brand-emerald',
      icon: <Check size={14} className="stroke-[3]" />,
      textColor: 'text-brand-midnight',
      tag: 'Concluído',
      tagColor: 'text-brand-emerald bg-emerald-50',
    },
    'in-progress': {
      border: 'border-brand-blue bg-sky-50/50 shadow-xs hover:border-sky-500',
      badge: 'bg-brand-blue text-white shadow-xs',
      icon: <Play size={12} className="fill-white" />,
      textColor: 'text-brand-blue font-bold',
      tag: 'Em andamento',
      tagColor: 'text-brand-blue bg-sky-100',
    },
    locked: {
      border: 'border-slate-200 bg-slate-50/60 opacity-75 hover:opacity-100',
      badge: 'bg-slate-200 text-slate-500',
      icon: <Lock size={12} />,
      textColor: 'text-slate-500',
      tag: 'Bloqueado',
      tagColor: 'text-slate-500 bg-slate-200/60',
    },
  }[status];

  return (
    <div
      role="button"
      tabIndex={isLocked ? -1 : 0}
      onClick={() => !isLocked && onClick?.(id)}
      onKeyDown={(e) => {
        if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.(id);
        }
      }}
      className={cn(
        'group flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border p-4 shadow-2xs transition-all select-none',
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-xs',
        statusConfig.border,
        className,
      )}
      data-testid="skill-node"
      data-status={status}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors',
            statusConfig.badge,
          )}
          data-testid="skill-node-icon"
        >
          {statusConfig.icon}
        </div>

        <div className="flex flex-col">
          <span
            className={cn(
              'text-sm font-semibold font-sans',
              statusConfig.textColor,
            )}
            data-testid="skill-node-title"
          >
            {title}
          </span>
          {category && (
            <span className="text-[11px] text-slate-400 font-sans">
              {category}
            </span>
          )}
        </div>
      </div>

      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
          statusConfig.tagColor,
        )}
      >
        {statusConfig.tag}
      </span>
    </div>
  );
}
