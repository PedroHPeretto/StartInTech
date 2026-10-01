import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    period?: string;
  };
  subtitle?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:shadow-xs select-none',
        className,
      )}
      data-testid="kpi-card"
    >
      {/* Top Header: Title & Icon Container */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider"
          data-testid="kpi-card-title"
        >
          {title}
        </span>
        <div
          className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-brand-blue"
          data-testid="kpi-card-icon"
        >
          {icon}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-3">
        <span
          className="font-heading text-3xl font-extrabold text-brand-midnight tracking-tight"
          data-testid="kpi-card-value"
        >
          {value}
        </span>
      </div>

      {/* Footer: Trend or Subtitle Context */}
      <div className="flex items-center gap-2 text-xs">
        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-semibold',
              trend.isPositive !== false
                ? 'text-brand-emerald'
                : 'text-rose-600',
            )}
            data-testid="kpi-card-trend"
          >
            {trend.isPositive !== false ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{trend.value}</span>
            {trend.period && (
              <span className="font-normal text-slate-500">{trend.period}</span>
            )}
          </div>
        )}
        {!trend && subtitle && (
          <span
            className="text-slate-500 font-medium"
            data-testid="kpi-card-subtitle"
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
