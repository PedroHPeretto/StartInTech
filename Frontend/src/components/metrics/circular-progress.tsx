import { cn } from '@/lib/utils';
import { getSemanticStrokeColor } from '@/components/metrics/circular-progress-semantic';

export type CircularProgressStrokeMode = 'default' | 'semantic';

export interface CircularProgressProps {
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  variant?: 'light' | 'dark';
  strokeMode?: CircularProgressStrokeMode;
  className?: string;
}

function resolveStrokeColor(
  normalizedValue: number,
  isDark: boolean,
  strokeMode: CircularProgressStrokeMode,
): string {
  if (strokeMode === 'semantic') {
    return getSemanticStrokeColor(normalizedValue);
  }
  return isDark ? '#0284C7' : '#10B981';
}

function resolveLabelColor(
  normalizedValue: number,
  isDark: boolean,
  strokeMode: CircularProgressStrokeMode,
): string {
  if (strokeMode === 'semantic') {
    if (normalizedValue >= 80) {
      return 'text-emerald-600';
    }
    if (normalizedValue >= 50) {
      return 'text-amber-600';
    }
    return 'text-red-600';
  }
  return isDark ? 'text-sky-300' : 'text-brand-emerald';
}

export function CircularProgress({
  value,
  label,
  size = 140,
  strokeWidth = 10,
  variant = 'light',
  strokeMode = 'default',
  className,
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)));

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  const isDark = variant === 'dark';
  const strokeColor = resolveStrokeColor(normalizedValue, isDark, strokeMode);

  const computedLabel =
    label ??
    (normalizedValue >= 80
      ? 'Muito bom'
      : normalizedValue >= 50
        ? 'Médio'
        : 'Precisa melhorar');

  return (
    <div
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'relative inline-flex flex-col items-center justify-center p-4 rounded-2xl select-none',
        isDark ? 'bg-brand-midnight text-white' : 'bg-white text-slate-800',
        className,
      )}
      style={{ width: size, height: size }}
      data-testid="circular-progress"
      data-stroke-mode={strokeMode}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90 transform"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          data-testid="circular-progress-fill"
          data-semantic-tier={
            strokeMode === 'semantic'
              ? normalizedValue >= 80
                ? 'high'
                : normalizedValue >= 50
                  ? 'medium'
                  : 'low'
              : undefined
          }
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            'font-heading font-extrabold tracking-tight',
            isDark ? 'text-white' : 'text-brand-midnight',
            size >= 140 ? 'text-3xl' : 'text-2xl',
          )}
          data-testid="circular-progress-value"
        >
          {normalizedValue}
        </span>
        {computedLabel ? (
          <span
            className={cn(
              'font-sans font-semibold mt-0.5 text-xs tracking-tight',
              resolveLabelColor(normalizedValue, isDark, strokeMode),
            )}
            data-testid="circular-progress-label"
          >
            {computedLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export { CircularProgress as AtsScoreGauge };
