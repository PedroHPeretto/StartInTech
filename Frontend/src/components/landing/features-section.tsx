import {
  FileCheck2,
  Sparkles,
  GitFork,
  Briefcase,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { SectionHeading } from './section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FeaturesSection() {
  return (
    <section
      id="funcionalidades"
      className="relative scroll-mt-16 bg-white py-20 sm:py-28"
      data-testid="features-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Recursos completos"
          title="Tudo o que você precisa para entrar na área"
          subtitle="Ferramentas inteligentes projetadas para encurtar a distância entre os seus estudos e a sua primeira contratação."
          align="center"
          className="mb-14"
        />

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Featured ATS Analysis (spans 2 columns on lg) */}
          <Card className="flex flex-col justify-between overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-white to-sky-50/40 p-6 shadow-xs hover:shadow-card-hover transition-all duration-300 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-sky-500 text-white shadow-xs">
                  <FileCheck2 className="size-6" />
                </div>
                <Badge
                  variant="remoto"
                  size="sm"
                  className="font-semibold text-brand-blue"
                >
                  Análise Inteligente
                </Badge>
              </div>

              <h3 className="mt-5 font-heading text-xl sm:text-2xl font-bold text-brand-midnight">
                Análise ATS e Diagnóstico de Currículo
              </h3>
              <p className="mt-2 text-sm sm:text-base font-sans text-slate-600 leading-relaxed max-w-xl">
                Descubra sua pontuação de compatibilidade com os robôs de RH,
                identifique palavras-chave faltantes e receba recomendações
                diretas para ser notado pelos recrutadores.
              </p>
            </div>

            {/* Embedded Resume Preview Visual */}
            <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <span className="font-heading text-xs font-bold text-brand-midnight block">
                      Curriculo_Desenvolvedor_Junior.pdf
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Análise concluída em 3 segundos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm" className="font-bold">
                    ✓ 92% Aprovado no ATS
                  </Badge>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="size-3.5 shrink-0 text-emerald-600" />
                  <span>Estrutura legível</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="size-3.5 shrink-0 text-emerald-600" />
                  <span>Termos técnicos chave</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="size-3.5 shrink-0 text-emerald-600" />
                  <span>Formatação sem erros</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Skill Gap Diagnosis */}
          <Card className="flex flex-col justify-between border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-card-hover transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                  <Sparkles className="size-6" />
                </div>
                <Badge variant="success" size="sm" className="font-semibold">
                  Gap de Habilidades
                </Badge>
              </div>

              <h3 className="mt-5 font-heading text-lg sm:text-xl font-bold text-brand-midnight">
                Diagnóstico de Tecnologias
              </h3>
              <p className="mt-2 text-sm font-sans text-slate-600 leading-relaxed">
                Compare seu perfil técnico com os requisitos das vagas mais
                abertas do mercado e saiba exatamente o que priorizar nos seus
                estudos.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                ✓ JavaScript
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                ✓ React
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                + TypeScript a dominar
              </span>
            </div>
          </Card>

          {/* Card 3: Personalized Roadmap */}
          <Card className="flex flex-col justify-between border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-card-hover transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
                  <GitFork className="size-6" />
                </div>
                <Badge
                  variant="hibrido"
                  size="sm"
                  className="font-semibold text-indigo-700"
                >
                  Trilha Personalizada
                </Badge>
              </div>

              <h3 className="mt-5 font-heading text-lg sm:text-xl font-bold text-brand-midnight">
                Roadmap de Estudos
              </h3>
              <p className="mt-2 text-sm font-sans text-slate-600 leading-relaxed">
                Acompanhe seu progresso de aprendizagem com etapas práticas, do
                básico aos projetos de portfólio que chamam a atenção das
                empresas.
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Progresso da Trilha</span>
                <span className="text-brand-blue">4 / 6 módulos</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-blue"
                  style={{ width: '66%' }}
                />
              </div>
            </div>
          </Card>

          {/* Card 4: Intelligent Job Matching (spans 2 columns on lg) */}
          <Card className="flex flex-col justify-between border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/40 p-6 shadow-xs hover:shadow-card-hover transition-all duration-300 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-emerald text-white shadow-xs">
                  <Briefcase className="size-6" />
                </div>
                <Badge variant="success" size="sm" className="font-semibold">
                  Match Inteligente
                </Badge>
              </div>

              <h3 className="mt-5 font-heading text-xl sm:text-2xl font-bold text-brand-midnight">
                Vagas Júnior e Estágio com Match
              </h3>
              <p className="mt-2 text-sm sm:text-base font-sans text-slate-600 leading-relaxed max-w-xl">
                Chega de aplicar às cegas. Veja exatamente a porcentagem de
                afinidade do seu currículo com cada oportunidade antes de enviar
                sua candidatura.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-brand-midnight">
                  Vagas compatíveis atualizadas diariamente
                </span>
              </div>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500">
                Filtros por regime Remoto, Híbrido e Presencial
              </span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
