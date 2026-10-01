import { ChevronRight } from 'lucide-react';
import {
  PriorityBadge,
  type PriorityLevel,
} from '@/components/feedback/priority-badge';
import { cn } from '@/lib/utils';

export interface RecommendationCardProps {
  stepNumber: number;
  title: string;
  description: string;
  priority?: PriorityLevel;
  onAction?: () => void;
  className?: string;
}

export function RecommendationCard({
  stepNumber,
  title,
  description,
  priority = 'medium',
  onAction,
  className,
}: RecommendationCardProps) {
  return (
    <div
      onClick={onAction}
      className={cn(
        'group flex w-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-brand-blue/30 hover:shadow-xs select-none sm:flex-row sm:items-center cursor-pointer',
        className,
      )}
      data-testid="recommendation-card"
    >
      {/* Left: Number badge + Text content */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-heading font-bold text-sm text-brand-blue"
          data-testid="recommendation-number-badge"
        >
          {stepNumber}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="text-sm font-bold font-sans text-brand-midnight group-hover:text-brand-blue transition-colors"
              data-testid="recommendation-title"
            >
              {title}
            </h3>
          </div>
          <p
            className="text-xs font-sans text-slate-500 leading-relaxed max-w-xl"
            data-testid="recommendation-description"
          >
            {description}
          </p>
        </div>
      </div>

      {/* Right: Priority Badge & Action Chevron */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0 shrink-0">
        <PriorityBadge priority={priority} />

        <div className="flex size-8 items-center justify-center rounded-lg text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}
