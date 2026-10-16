import { Check, Sparkles, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ProductMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-lg items-center justify-center p-4 lg:max-w-none select-none',
        className,
      )}
      data-testid="product-mockup"
    >
      {/* Background ambient gradient glow blobs */}
      <div
        className="pointer-events-none absolute -left-6 top-1/4 size-72 rounded-full bg-brand-blue/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 bottom-1/4 size-72 rounded-full bg-brand-emerald/20 blur-3xl"
        aria-hidden
      />

      <div className="relative grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {/* Card 1: ATS Score Gauge */}
        <div className="glass group relative -rotate-2 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:rotate-0 hover:shadow-2xl animate-float">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="font-heading text-sm font-bold text-brand-midnight">
              ATS Score
            </span>
            <Badge variant="success" size="sm" className="gap-1">
              <Sparkles className="size-3 text-emerald-600" />
              Excelente
            </Badge>
          </div>

          <div className="my-3 flex flex-col items-center justify-center py-2">
            <div className="relative flex size-24 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-emerald transition-all duration-1000 ease-out"
                  strokeDasharray="88, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-heading text-2xl font-bold text-brand-midnight">
                  88%
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Compatível
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Formatação e termos aprovados para robôs ATS
          </p>
        </div>

        {/* Card 2: Job Match Card */}
        <div className="glass group relative rotate-2 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:rotate-0 hover:shadow-2xl animate-float-delayed">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-sky-600 text-white shadow-xs">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Vaga recomendada
                </p>
                <h4 className="font-heading text-sm font-bold text-brand-midnight leading-tight">
                  Analista de Dados Júnior
                </h4>
              </div>
            </div>
            <Badge variant="success" size="sm" className="shrink-0 font-bold">
              ✓ 94% Match
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium">
              Híbrido
            </span>
            <span>São Paulo, SP</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              SQL
            </span>
            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              Power BI
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Python
            </span>
          </div>
        </div>

        {/* Card 3: Skill Gap Card */}
        <div className="glass group relative -rotate-1 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:rotate-0 hover:shadow-2xl animate-float-delayed">
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-brand-midnight">
              Skill Gap
            </span>
            <span className="text-[11px] font-semibold text-brand-blue">
              2 para dominar
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Tecnologias que faltam no seu perfil para esta vaga:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <Check className="size-3 text-emerald-600" />
              SQL Avançado
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Git & GitHub
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Docker básico
            </div>
          </div>
        </div>

        {/* Card 4: Roadmap Progress Card */}
        <div className="glass group relative rotate-1 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:rotate-0 hover:shadow-2xl animate-float">
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-brand-midnight">
              Roadmap Progress
            </span>
            <span className="font-heading text-xs font-bold text-brand-emerald">
              75% concluído
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Trilha: Desenvolvimento de Software
          </p>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-emerald transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Próximo passo:</span>
            <span className="font-semibold text-brand-midnight">
              Projeto de Portfólio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
