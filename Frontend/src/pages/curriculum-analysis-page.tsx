import type {
  ExtractedSkillDto,
  SkillsExtractionResponseDto,
} from '@startintech/shared';
import { useParams } from '@tanstack/react-router';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { extractResumeSkills } from '@/resumes/resume-api';
import { getSkillCategoryLabel } from '@/resumes/skill-category-label';

type AnalysisErrorKind = 'insufficient_text' | 'gateway' | 'generic';

function SkillBadgeList({
  skills,
  variant,
  panelTestId,
}: {
  skills: ExtractedSkillDto[];
  variant: 'success' | 'warning';
  panelTestId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid={panelTestId}>
      {skills.map((skill) => (
        <Badge
          key={skill.id}
          variant={variant}
          data-testid={`skill-badge-${skill.id}`}
        >
          {skill.name} · {getSkillCategoryLabel(skill.category)}
        </Badge>
      ))}
    </div>
  );
}

function SkillsExtractionSkeleton() {
  return (
    <div
      className="mt-8 space-y-6"
      data-testid="skills-extraction-skeleton"
      aria-busy="true"
      aria-label="Carregando análise de competências"
    >
      <Skeleton className="h-5 w-2/3 max-w-sm" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border bg-white p-5">
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-24" />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-border bg-white p-5">
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

function resolveExtractionError(error: unknown): {
  kind: AnalysisErrorKind;
  message: string;
} {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 422) {
      return {
        kind: 'insufficient_text',
        message:
          'Não foi possível analisar o currículo: o texto é insuficiente ou ilegível para extrair competências.',
      };
    }
    if (status === 502) {
      return {
        kind: 'gateway',
        message:
          'O serviço de análise está temporariamente indisponível. Tente novamente em instantes.',
      };
    }
  }

  return {
    kind: 'generic',
    message: 'Não foi possível concluir a análise. Tente novamente.',
  };
}

export function CurriculumAnalysisPage() {
  const { id: resumeId } = useParams({ from: '/curriculum/analysis/$id' });
  const [result, setResult] = useState<SkillsExtractionResponseDto | null>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<{
    kind: AnalysisErrorKind;
    message: string;
  } | null>(null);

  const runExtraction = useCallback(async () => {
    setIsExtracting(true);
    setError(null);

    try {
      const data = await extractResumeSkills(resumeId);
      setResult(data);
    } catch (err) {
      setError(resolveExtractionError(err));
    } finally {
      setIsExtracting(false);
    }
  }, [resumeId]);

  return (
    <main className="min-h-screen bg-brand-light-gray px-4 py-10">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <BrandHeader href={undefined} showTagline />
        </div>

        <h1 className="text-center font-heading text-2xl font-bold text-brand-midnight">
          Análise de competências
        </h1>
        <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
          Compare as competências do seu currículo com os requisitos da sua
          trilha de carreira.
        </p>

        {error ? (
          <div className="mt-6">
            {error.kind === 'gateway' ? (
              <AlertBanner
                variant="warning"
                message={error.message}
                actionLabel="Tentar novamente"
                onAction={() => void runExtraction()}
              />
            ) : (
              <p
                className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-center font-sans text-sm text-amber-950"
                role="alert"
                data-testid="skills-extraction-error"
              >
                {error.message}
              </p>
            )}
          </div>
        ) : null}

        {!result && !isExtracting ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <p className="font-sans text-sm text-slate-600">
              Quando estiver pronto, inicie a extração semântica das
              competências do currículo enviado.
            </p>
            <Button
              type="button"
              className="gap-2"
              onClick={() => void runExtraction()}
              data-testid="analyze-skills-btn"
            >
              <Sparkles size={16} aria-hidden />
              Analisar competências
            </Button>
          </div>
        ) : null}

        {isExtracting ? <SkillsExtractionSkeleton /> : null}

        {result && !isExtracting ? (
          <div
            className="mt-8 space-y-6"
            data-testid="skills-extraction-result"
          >
            <p className="text-center font-sans text-sm text-slate-600">
              Trilha:{' '}
              <span className="font-semibold text-brand-midnight">
                {result.careerTrack.name}
              </span>
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <section
                className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5"
                aria-labelledby="detected-skills-heading"
              >
                <h2
                  id="detected-skills-heading"
                  className="font-heading text-base font-bold text-brand-midnight"
                >
                  Competências Detectadas
                </h2>
                <p className="mt-1 font-sans text-xs text-muted-foreground">
                  {result.totalDetected} competência
                  {result.totalDetected === 1 ? '' : 's'} encontrada
                  {result.totalDetected === 1 ? '' : 's'}
                </p>
                <div className="mt-4">
                  <SkillBadgeList
                    skills={result.skills.detected}
                    variant="success"
                    panelTestId="detected-skills-panel"
                  />
                </div>
              </section>

              <section
                className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5"
                aria-labelledby="missing-skills-heading"
              >
                <h2
                  id="missing-skills-heading"
                  className="font-heading text-base font-bold text-brand-midnight"
                >
                  Competências a Desenvolver / Gaps da Carreira
                </h2>
                <p className="mt-1 font-sans text-xs text-muted-foreground">
                  {result.totalMissing} gap
                  {result.totalMissing === 1 ? '' : 's'} identificado
                  {result.totalMissing === 1 ? '' : 's'}
                </p>
                <div className="mt-4">
                  <SkillBadgeList
                    skills={result.skills.missing}
                    variant="warning"
                    panelTestId="missing-skills-panel"
                  />
                </div>
              </section>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => void runExtraction()}
                data-testid="reanalyze-skills-btn"
              >
                Analisar novamente
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
