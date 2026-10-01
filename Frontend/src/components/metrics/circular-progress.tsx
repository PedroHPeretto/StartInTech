import { cn } from '@/lib/utils';

export interface CircularProgressProps {
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  variant?: 'light' | 'dark';
  className?: string;
}

export function CircularProgress({
  value,
  label,
  size = 140,
  strokeWidth = 10,
  variant = 'light',
  className,
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)));

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  const isDark = variant === 'dark';

  // Default status label based on score
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
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90 transform"
        aria-hidden="true"
      >
        {/* Track circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Fill circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={isDark ? '#0284C7' : '#10B981'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          data-testid="circular-progress-fill"
        />
      </svg>

      {/* Center Label */}
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
        {computedLabel && (
          <span
            className={cn(
              'font-sans font-semibold mt-0.5 text-xs tracking-tight',
              isDark ? 'text-sky-300' : 'text-brand-emerald',
            )}
            data-testid="circular-progress-label"
          >
            {computedLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export { CircularProgress as AtsScoreGauge };
