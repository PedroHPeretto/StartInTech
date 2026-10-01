import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underlined' | 'pills';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underlined',
  className,
}: TabsProps) {
  const isUnderlined = variant === 'underlined';

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'flex select-none',
        isUnderlined
          ? 'border-b border-slate-200 gap-6'
          : 'bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/60',
        className,
      )}
      data-testid="tabs-container"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        if (isUnderlined) {
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'group relative flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-colors outline-none cursor-pointer',
                isActive
                  ? 'text-brand-blue font-semibold'
                  : 'text-slate-500 hover:text-slate-800',
              )}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon && (
                <span className="shrink-0 transition-colors group-hover:text-slate-700">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    isActive
                      ? 'bg-sky-100 text-brand-blue'
                      : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {/* Active Indicator Line */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-blue animate-in fade-in duration-200"
                  data-testid="active-tab-indicator"
                />
              )}
            </button>
          );
        }

        // Pills variant
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all outline-none cursor-pointer',
              isActive
                ? 'bg-white text-brand-midnight font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
            )}
            data-testid={`tab-${tab.id}`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-xs font-semibold',
                  isActive
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-200 text-slate-600',
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
