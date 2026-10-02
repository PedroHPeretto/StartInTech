import { cn } from '@/lib/utils';

export interface CareerProgressProps {
  completedTopics?: number;
  totalTopics?: number;
  /** When set, displayed as-is (e.g. server-computed roadmap metrics). */
  percentage?: number;
  title?: string;
  variant?: 'linear' | 'ring';
  className?: string;
  showTopicSummary?: boolean;
}

export function CareerTrailProgress({
  completedTopics = 0,
  totalTopics = 0,
  percentage: percentageOverride,
  title = 'Progresso na Trilha',
  variant = 'linear',
  className,
  showTopicSummary = true,
}: CareerProgressProps) {
  const percentage =
    percentageOverride !== undefined
      ? Math.min(100, Math.max(0, percentageOverride))
      : totalTopics > 0
        ? Math.min(100, Math.round((completedTopics / totalTopics) * 100))
        : 0;

  if (variant === 'ring') {
    const size = 80;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 p-4 select-none',
          className,
        )}
        data-testid="career-progress-ring"
      >
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            className="-rotate-90 transform"
            aria-hidden="true"
          >
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#0284C7"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute font-heading text-sm font-bold text-brand-midnight">
            {percentage}%
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-500 text-center">
          {title}
        </span>
      </div>
    );
  }

  // Linear variant
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs select-none',
        className,
      )}
      data-testid="career-progress-linear"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-midnight">
          {title}
        </span>
        <span
          className="font-heading text-sm font-bold text-brand-blue"
          data-testid="career-progress-percentage"
        >
          {percentage}% concluído
        </span>
      </div>

      {/* Progress Bar Track */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-blue transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          data-testid="career-progress-bar"
        />
      </div>

      {showTopicSummary && totalTopics > 0 ? (
        <p className="text-xs font-sans text-slate-500">
          Você completou{' '}
          <span className="font-semibold text-slate-700">
            {completedTopics}
          </span>{' '}
          de <span className="font-semibold text-slate-700">{totalTopics}</span>{' '}
          tópicos essenciais
        </p>
      ) : null}
    </div>
  );
}
