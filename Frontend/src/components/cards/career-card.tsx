import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CareerCardProps {
  id: string;
  title: string;
  icon: ReactNode;
  description?: string;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

export function CareerCard({
  id,
  title,
  icon,
  description,
  isSelected = false,
  onSelect,
  className,
}: CareerCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
      className={cn(
        'group flex w-full items-center gap-4 rounded-2xl p-4 transition-all outline-none cursor-pointer select-none',
        isSelected
          ? 'border-2 border-brand-blue bg-sky-50/70 shadow-xs'
          : 'border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs',
        className,
      )}
      data-testid="career-card"
    >
      {/* Icon Container */}
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors',
          isSelected
            ? 'bg-brand-blue text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800',
        )}
        data-testid="career-card-icon"
      >
        {icon}
      </div>

      {/* Career Info */}
      <div className="flex flex-col text-left">
        <h3
          className={cn(
            'text-sm font-bold font-sans transition-colors',
            isSelected
              ? 'text-brand-blue font-extrabold'
              : 'text-brand-midnight',
          )}
          data-testid="career-card-title"
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
