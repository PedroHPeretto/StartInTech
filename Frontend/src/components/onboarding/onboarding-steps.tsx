import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingStepsProps {
  steps: string[];
  currentStep: number; // 1-indexed (e.g. 1, 2, 3)
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function OnboardingSteps({
  steps,
  currentStep,
  onStepClick,
  className,
}: OnboardingStepsProps) {
  return (
    <div
      className={cn('flex w-full flex-col gap-4 select-none', className)}
      data-testid="onboarding-steps"
    >
      {/* Desktop & Tablet Stepper with Labels and Connectors */}
      <div className="hidden sm:flex w-full items-center justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={label}
              className={cn('flex flex-1 items-center', isLast && 'flex-none')}
            >
              <div
                role={onStepClick && !isPending ? 'button' : undefined}
                onClick={() =>
                  onStepClick && !isPending && onStepClick(stepNumber)
                }
                className="flex items-center gap-3 cursor-pointer outline-none"
                data-testid={`onboarding-step-${stepNumber}`}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold transition-all',
                    isDone && 'bg-brand-emerald text-white shadow-xs',
                    isActive &&
                      'bg-brand-blue text-white shadow-sm ring-4 ring-sky-100',
                    isPending &&
                      'bg-slate-100 text-slate-400 border border-slate-200',
                  )}
                  data-testid={`onboarding-step-circle-${stepNumber}`}
                >
                  {isDone ? (
                    <Check size={14} className="stroke-[3]" />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    'text-xs font-sans whitespace-nowrap',
                    isDone && 'font-semibold text-brand-emerald',
                    isActive && 'font-bold text-brand-midnight',
                    isPending && 'font-medium text-slate-400',
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connecting Line to next step */}
              {!isLast && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1 rounded-full transition-colors',
                    isDone ? 'bg-brand-emerald' : 'bg-slate-200',
                  )}
                  data-testid={`onboarding-step-line-${stepNumber}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Compact Dots View */}
      <div
        className="flex sm:hidden items-center justify-center gap-2"
        data-testid="onboarding-steps-mobile"
      >
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={label}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                isActive
                  ? 'w-6 bg-brand-blue'
                  : isDone
                    ? 'w-2 bg-brand-emerald'
                    : 'w-2 bg-slate-200',
              )}
              aria-label={`Etapa ${stepNumber}: ${label}`}
            />
          );
        })}
      </div>
    </div>
  );
}
