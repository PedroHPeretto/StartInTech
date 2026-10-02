import type {
  ExtractedSkillDto,
  FeedbackReportDto,
  ResumeEvaluationResponseDto,
  ResumeHistoryItemDto,
  SkillsExtractionResponseDto,
} from '@startintech/shared';
import { useNavigate, useParams } from '@tanstack/react-router';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { CircularProgress } from '@/components/metrics/circular-progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMarketReadinessLabel } from '@/resumes/market-readiness-label';
import { ResumeAnalysisHistorySelector } from '@/resumes/resume-analysis-history-selector';
import {
  evaluateResume,
  extractResumeSkills,
  fetchResumeHistory,
} from '@/resumes/resume-api';
import { getSkillCategoryLabel } from '@/resumes/skill-category-label';

type ExtractionErrorKind = 'insufficient_text' | 'gateway' | 'generic';
type EvaluationErrorKind = 'not_found' | 'conflict' | 'gateway' | 'generic';

const HISTORY_RETENTION_MESSAGE =
  'Mantemos apenas as três análises mais recentes do seu currículo. Versões mais antigas são descartadas automaticamente.';

const ANALYSIS_REPLACED_MESSAGE =
  'Esta análise foi substituída pela versão mais recente do seu histórico.';

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

function EvaluationSkeleton() {
  return (
    <div
      className="mt-8 space-y-6"
      data-testid="ats-evaluation-skeleton"
      aria-busy="true"
      aria-label="Carregando diagnóstico ATS"
    >
      <div className="flex justify-center">
        <Skeleton className="size-36 rounded-2xl" />
      </div>
      <Skeleton className="mx-auto h-4 w-full max-w-2xl" />
      <Skeleton className="mx-auto h-4 w-5/6 max-w-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}

function FeedbackReportSections({ report }: { report: FeedbackReportDto }) {
  return (
    <div className="space-y-6" data-testid="ats-feedback-report">
      <p className="text-center font-sans text-sm leading-relaxed text-slate-700">
        {report.summary}
      </p>

      <div className="flex justify-center">
        <Badge variant="outline" data-testid="market-readiness-badge">
          Prontidão de mercado:{' '}
          {getMarketReadinessLabel(report.marketReadiness)}
        </Badge>
      </div>

      <section
        className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5"
        aria-labelledby="strengths-heading"
      >
        <h2
          id="strengths-heading"
          className="font-heading text-base font-bold text-brand-midnight"
        >
          Pontos Fortes
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 font-sans text-sm text-slate-700">
          {report.strengths.map((item) => (
            <li key={item} data-testid="feedback-strength-item">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5"
        aria-labelledby="improvements-heading"
      >
        <h2
          id="improvements-heading"
          className="font-heading text-base font-bold text-brand-midnight"
        >
          Pontos de Atenção
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 font-sans text-sm text-slate-700">
          {report.improvements.map((item) => (
            <li key={item} data-testid="feedback-improvement-item">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-2xl border border-sky-200/80 bg-sky-50/40 p-5"
        aria-labelledby="action-plan-heading"
      >
        <h2
          id="action-plan-heading"
          className="font-heading text-base font-bold text-brand-midnight"
        >
          Plano de Ação Recomendado
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 font-sans text-sm text-slate-700">
          {report.actionPlan.map((item) => (
            <li key={item} data-testid="feedback-action-item">
              {item}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function resolveExtractionError(error: unknown): {
  kind: ExtractionErrorKind;
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

function resolveEvaluationError(error: unknown): {
  kind: EvaluationErrorKind;
  message: string;
} {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return {
        kind: 'not_found',
        message: ANALYSIS_REPLACED_MESSAGE,
      };
    }
    if (status === 409) {
      return {
        kind: 'conflict',
        message:
          'Extraia as competências do currículo antes de gerar o diagnóstico ATS.',
      };
    }
    if (status === 502) {
      return {
        kind: 'gateway',
        message:
          'O serviço de avaliação está temporariamente indisponível. Tente novamente em instantes.',
      };
    }
  }

  return {
    kind: 'generic',
    message: 'Não foi possível carregar o diagnóstico ATS. Tente novamente.',
  };
}

export function CurriculumAnalysisPage() {
  const { id: resumeId } = useParams({ from: '/curriculum/analysis/$id' });

  return <CurriculumAnalysisView key={resumeId} resumeId={resumeId} />;
}

function CurriculumAnalysisView({ resumeId }: { resumeId: string }) {
  const navigate = useNavigate();

  const [history, setHistory] = useState<ResumeHistoryItemDto[]>([]);
  const [skillsResult, setSkillsResult] =
    useState<SkillsExtractionResponseDto | null>(null);
  const [evaluation, setEvaluation] =
    useState<ResumeEvaluationResponseDto | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(true);
  const [extractionError, setExtractionError] = useState<{
    kind: ExtractionErrorKind;
    message: string;
  } | null>(null);
  const [evaluationError, setEvaluationError] = useState<{
    kind: EvaluationErrorKind;
    message: string;
  } | null>(null);
  const [needsSkillsBeforeEvaluate, setNeedsSkillsBeforeEvaluate] =
    useState(false);

  const runEvaluation = useCallback(async () => {
    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const data = await evaluateResume(resumeId);
      setEvaluation(data);
      setNeedsSkillsBeforeEvaluate(false);

      try {
        const skills = await extractResumeSkills(resumeId);
        setSkillsResult(skills);
      } catch {
        // Skill panels remain hidden when extraction fails after evaluation.
      }
    } catch (err) {
      const resolved = resolveEvaluationError(err);
      setEvaluation(null);
      setEvaluationError(resolved);
      setNeedsSkillsBeforeEvaluate(resolved.kind === 'conflict');
    } finally {
      setIsEvaluating(false);
    }
  }, [resumeId]);

  const runExtraction = useCallback(async () => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const data = await extractResumeSkills(resumeId);
      setSkillsResult(data);
      await runEvaluation();
    } catch (err) {
      setExtractionError(resolveExtractionError(err));
    } finally {
      setIsExtracting(false);
    }
  }, [resumeId, runEvaluation]);

  useEffect(() => {
    const controller = new AbortController();

    fetchResumeHistory()
      .then((items) => {
        if (controller.signal.aborted) {
          return;
        }
        setHistory(items);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setHistory([]);
      });

    evaluateResume(resumeId)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setEvaluation(data);
        setNeedsSkillsBeforeEvaluate(false);
        return extractResumeSkills(resumeId)
          .then((skills) => {
            if (controller.signal.aborted) {
              return;
            }
            setSkillsResult(skills);
          })
          .catch(() => undefined);
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          return;
        }
        const resolved = resolveEvaluationError(err);
        setEvaluation(null);
        setEvaluationError(resolved);
        setNeedsSkillsBeforeEvaluate(resolved.kind === 'conflict');
      })
      .finally(() => {
        if (controller.signal.aborted) {
          return;
        }
        setIsEvaluating(false);
      });

    return () => controller.abort();
  }, [resumeId]);

  const handleHistorySelect = (nextId: string) => {
    if (nextId === resumeId) {
      return;
    }

    void navigate({
      to: '/curriculum/analysis/$id',
      params: { id: nextId },
    });
  };

  const showSkillsPrompt =
    !skillsResult &&
    !isExtracting &&
    evaluationError?.kind !== 'not_found' &&
    (needsSkillsBeforeEvaluate || !evaluation);
  const showEvaluation =
    Boolean(evaluation) &&
    !isEvaluating &&
    evaluationError?.kind !== 'not_found';

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
          trilha de carreira e acompanhe o diagnóstico ATS.
        </p>

        {history.length > 0 ? (
          <div className="mt-6 space-y-4">
            <AlertBanner variant="info" message={HISTORY_RETENTION_MESSAGE} />
            <ResumeAnalysisHistorySelector
              items={history}
              selectedId={resumeId}
              onSelect={handleHistorySelect}
            />
          </div>
        ) : null}

        {evaluationError?.kind === 'not_found' ? (
          <p
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-center font-sans text-sm text-amber-950"
            role="alert"
            data-testid="analysis-not-found"
          >
            {evaluationError.message}
          </p>
        ) : null}

        {evaluationError && evaluationError.kind !== 'not_found' ? (
          <div className="mt-6">
            {evaluationError.kind === 'gateway' ? (
              <AlertBanner
                variant="warning"
                message={evaluationError.message}
                actionLabel="Tentar novamente"
                onAction={() => void runEvaluation()}
              />
            ) : (
              <p
                className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-center font-sans text-sm text-amber-950"
                role="alert"
                data-testid="ats-evaluation-error"
              >
                {evaluationError.message}
              </p>
            )}
          </div>
        ) : null}

        {extractionError ? (
          <div className="mt-6">
            {extractionError.kind === 'gateway' ? (
              <AlertBanner
                variant="warning"
                message={extractionError.message}
                actionLabel="Tentar novamente"
                onAction={() => void runExtraction()}
              />
            ) : (
              <p
                className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-center font-sans text-sm text-amber-950"
                role="alert"
                data-testid="skills-extraction-error"
              >
                {extractionError.message}
              </p>
            )}
          </div>
        ) : null}

        {isEvaluating ? <EvaluationSkeleton /> : null}

        {showEvaluation && evaluation ? (
          <section
            className="mt-8 space-y-6"
            data-testid="ats-evaluation-result"
          >
            <h2 className="text-center font-heading text-lg font-bold text-brand-midnight">
              Diagnóstico ATS
            </h2>
            <div className="flex justify-center">
              <CircularProgress
                value={evaluation.atsScore}
                strokeMode="semantic"
                label="Score ATS"
              />
            </div>
            <FeedbackReportSections report={evaluation.report} />
          </section>
        ) : null}

        {showSkillsPrompt && !isEvaluating ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <p className="font-sans text-sm text-slate-600">
              Quando estiver pronto, inicie a extração semântica das
              competências do currículo enviado para liberar o diagnóstico ATS.
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

        {skillsResult && !isExtracting ? (
          <div
            className="mt-8 space-y-6"
            data-testid="skills-extraction-result"
          >
            <p className="text-center font-sans text-sm text-slate-600">
              Trilha:{' '}
              <span className="font-semibold text-brand-midnight">
                {skillsResult.careerTrack.name}
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
                  {skillsResult.totalDetected} competência
                  {skillsResult.totalDetected === 1 ? '' : 's'} encontrada
                  {skillsResult.totalDetected === 1 ? '' : 's'}
                </p>
                <div className="mt-4">
                  <SkillBadgeList
                    skills={skillsResult.skills.detected}
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
                  {skillsResult.totalMissing} gap
                  {skillsResult.totalMissing === 1 ? '' : 's'} identificado
                  {skillsResult.totalMissing === 1 ? '' : 's'}
                </p>
                <div className="mt-4">
                  <SkillBadgeList
                    skills={skillsResult.skills.missing}
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
