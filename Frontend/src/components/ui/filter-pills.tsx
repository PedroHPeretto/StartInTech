import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterPillsProps {
  options: FilterOption[];
  selected: string | string[];
  onChange: (selected: string | string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function FilterPills({
  options,
  selected,
  onChange,
  multiSelect = false,
  className,
}: FilterPillsProps) {
  const isSelected = (id: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(id);
    }
    return selected === id;
  };

  const handleToggle = (id: string) => {
    if (multiSelect) {
      const currentList = Array.isArray(selected) ? selected : [selected];
      const next = currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id];
      onChange(next);
    } else {
      onChange(id);
    }
  };

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 select-none', className)}
      data-testid="filter-pills"
    >
      {options.map((opt) => {
        const active = isSelected(opt.id);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleToggle(opt.id)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium font-sans transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
              active
                ? 'bg-brand-blue text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
            data-testid={`filter-pill-${opt.id}`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500',
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
