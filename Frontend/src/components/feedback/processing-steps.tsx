import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepStatus = 'done' | 'active' | 'pending';

export interface StepItem {
  id: string;
  title: string;
  subtitle?: string;
  status: StepStatus;
}

export interface ProcessingStepsProps {
  steps: StepItem[];
  className?: string;
}

export function ProcessingSteps({ steps, className }: ProcessingStepsProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs select-none',
        className,
      )}
      data-testid="processing-steps"
    >
      {steps.map((step) => {
        const isDone = step.status === 'done';
        const isActive = step.status === 'active';

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center justify-between rounded-xl px-4 py-3 transition-colors',
              isActive
                ? 'bg-sky-50/80 border border-sky-200/80 text-brand-midnight'
                : isDone
                  ? 'bg-slate-50/60 text-slate-800'
                  : 'text-slate-400',
            )}
            data-testid={`processing-step-${step.id}`}
          >
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isDone
                    ? 'bg-emerald-100 text-brand-emerald'
                    : isActive
                      ? 'bg-brand-blue text-white'
                      : 'bg-slate-200 text-slate-500',
                )}
                data-testid={`processing-step-icon-${step.id}`}
              >
                {isDone ? (
                  <Check size={14} className="stroke-[3]" />
                ) : isActive ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span className="size-2 rounded-full bg-slate-400" />
                )}
              </div>

              <div className="flex flex-col">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isActive && 'text-brand-blue font-bold',
                    isDone && 'text-slate-800',
                  )}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-xs text-slate-500">
                    {step.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Status badge */}
            <span
              className={cn(
                'text-xs font-semibold',
                isDone
                  ? 'text-brand-emerald'
                  : isActive
                    ? 'text-brand-blue'
                    : 'text-slate-400',
              )}
            >
              {isDone ? 'Concluído' : isActive ? 'Em andamento...' : 'Pendente'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
