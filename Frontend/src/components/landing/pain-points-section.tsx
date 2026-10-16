import { AlertCircle, CheckCircle2, ArrowDown } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { PAIN_POINTS } from './landing-content';
import { Card, CardContent } from '@/components/ui/card';

export function PainPointsSection() {
  return (
    <section
      id="dores"
      className="relative bg-slate-50/70 py-20 sm:py-24 border-y border-slate-200/60"
      data-testid="pain-points-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Enviar currículo e nunca ter resposta não é falta de talento."
          subtitle="O processo seletivo em tecnologia mudou. Entenda por que suas candidaturas não avançam e como a StartInTech te ajuda a virar o jogo."
          align="center"
          className="mb-14"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {PAIN_POINTS.map((item, index) => (
            <Card
              key={index}
              className="flex flex-col justify-between border-slate-200/80 bg-white shadow-xs hover:shadow-card-hover transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Problem Part */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertCircle className="size-4 shrink-0" />
                    <h3 className="font-heading text-sm font-bold">
                      {item.problemTitle}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs font-sans text-slate-600 leading-relaxed">
                    {item.problemText}
                  </p>
                </div>

                {/* Transition Indicator */}
                <div className="my-3 flex items-center justify-center text-slate-300">
                  <ArrowDown className="size-4 text-brand-emerald animate-bounce" />
                </div>

                {/* Solution Part */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <h4 className="font-heading text-sm font-bold">
                      {item.solutionTitle}
                    </h4>
                  </div>
                  <p className="mt-2 text-xs font-sans text-slate-600 leading-relaxed">
                    {item.solutionText}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
