import { Target, UploadCloud, Rocket } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { STEPS } from './landing-content';
import { Card, CardContent } from '@/components/ui/card';

const STEP_ICONS = [Target, UploadCloud, Rocket];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative scroll-mt-16 bg-slate-50/70 py-20 sm:py-28 border-y border-slate-200/60"
      data-testid="how-it-works-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Passo a passo"
          title="Do currículo à contratação em 3 passos"
          subtitle="Um caminho claro e descomplicado para você parar de perder tempo e focar no que realmente gera entrevistas."
          align="center"
          className="mb-16"
        />

        <div className="relative grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] || Target;

            return (
              <Card
                key={step.number}
                className="relative flex flex-col justify-between border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-card-hover transition-all duration-300"
              >
                <CardContent className="p-0">
                  {/* Step Number Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-sky-50 font-heading text-lg font-bold text-brand-blue border border-sky-100">
                      {step.number}
                    </span>
                    <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="size-6 text-brand-blue" />
                    </div>
                  </div>

                  <h3 className="mt-6 font-heading text-xl font-bold text-brand-midnight">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm font-sans text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
