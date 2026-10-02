import { type JobListingDto } from '@startintech/shared';
import { ChevronDown, MapPin } from 'lucide-react';
import { useState } from 'react';
import { GapSkillBadge } from '@/components/feedback/gap-skill-badge';
import { Badge } from '@/components/ui/badge';
import { CompanyLogoPlate } from '@/components/ui/company-logo-plate';
import { WorkModeBadge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DESCRIPTION_EXPAND_THRESHOLD = 10_000;

export interface JobListingCardProps {
  job: JobListingDto;
  className?: string;
}

export function JobListingCard({ job, className }: JobListingCardProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [matchDetailsExpanded, setMatchDetailsExpanded] = useState(false);
  const descriptionNeedsExpand =
    job.description.length > DESCRIPTION_EXPAND_THRESHOLD;
  const visibleDescription =
    descriptionNeedsExpand && !descriptionExpanded
      ? `${job.description.slice(0, DESCRIPTION_EXPAND_THRESHOLD)}…`
      : job.description;

  const match = job.match;
  const hasMatchBreakdown =
    match !== null &&
    (match.matchedSkills.length > 0 || match.missingSkills.length > 0);
  const showMatchExpandable = match !== null && hasMatchBreakdown;
  const showRequirementsList =
    match === null && job.requirements.length > 0;

  return (
    <article
      className={cn(
        'flex w-full flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs',
        className,
      )}
      data-testid="job-listing-card"
      data-job-id={job.id}
    >
      {match !== null ? (
        <div
          className="flex flex-wrap items-center gap-2"
          data-testid="job-listing-match-header"
        >
          <span
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-brand-midnight"
            data-testid="job-listing-match-score"
          >
            {match.score}% Compatível
          </span>
          {match.isHighCompatibility ? (
            <Badge
              variant="success"
              data-testid="job-listing-high-compatibility-seal"
            >
              Alta Compatibilidade
            </Badge>
          ) : null}
        </div>
      ) : (
        <p
          className="rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2 font-sans text-xs font-medium text-sky-900"
          data-testid="job-listing-match-cta"
        >
          Envie o seu currículo para calcular a sua compatibilidade
        </p>
      )}

      <div className="flex items-start gap-4">
        <CompanyLogoPlate companyName={job.company} size="md" />
        <div className="min-w-0 flex-1">
          <h2
            className="font-sans text-base font-bold text-brand-midnight"
            data-testid="job-listing-title"
          >
            {job.title}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span
              className="font-semibold text-slate-700"
              data-testid="job-listing-company"
            >
              {job.company}
            </span>
            <span className="size-1 rounded-full bg-slate-300" aria-hidden />
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" aria-hidden />
              <span data-testid="job-listing-location">{job.location}</span>
            </div>
            <span className="size-1 rounded-full bg-slate-300" aria-hidden />
            <WorkModeBadge mode={job.workplaceType} />
          </div>
        </div>
      </div>

      {job.description ? (
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p data-testid="job-listing-description">{visibleDescription}</p>
          {descriptionNeedsExpand && !descriptionExpanded ? (
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-brand-blue hover:underline"
              onClick={() => setDescriptionExpanded(true)}
              data-testid="job-listing-description-expand"
            >
              Ver mais
            </button>
          ) : null}
        </div>
      ) : null}

      {showMatchExpandable ? (
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-xl py-1 text-left text-sm font-semibold text-brand-blue outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            aria-expanded={matchDetailsExpanded}
            onClick={() => setMatchDetailsExpanded((current) => !current)}
            data-testid="job-listing-match-details-toggle"
          >
            <span>Ver requisitos de compatibilidade</span>
            <ChevronDown
              aria-hidden
              className={cn(
                'size-4 shrink-0 transition-transform',
                matchDetailsExpanded && 'rotate-180',
              )}
            />
          </button>
          {matchDetailsExpanded ? (
            <div
              className="mt-4 space-y-4"
              data-testid="job-listing-match-details"
            >
              {match.matchedSkills.length > 0 ? (
                <div>
                  <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Requisitos Atendidos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.matchedSkills.map((skill) => (
                      <GapSkillBadge
                        key={skill.id}
                        skillName={skill.name}
                        type="found"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {match.missingSkills.length > 0 ? (
                <div>
                  <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Requisitos Faltantes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.missingSkills.map((skill) => (
                      <GapSkillBadge
                        key={skill.id}
                        skillName={skill.name}
                        type="gap"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {showRequirementsList ? (
        <div
          className="border-t border-slate-100 pt-3"
          data-testid="job-listing-requirements"
        >
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-slate-500">
            Requisitos da vaga
          </p>
          <div className="flex flex-wrap gap-2">
            {job.requirements.map((skill) => (
              <GapSkillBadge
                key={skill.id}
                skillName={skill.name}
                type="gap"
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="font-sans text-xs text-slate-500">
          Trilha:{' '}
          <span className="font-semibold text-brand-blue">
            {job.careerTrack.name}
          </span>
        </p>
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: 'sm', variant: 'default' })}
          data-testid="job-listing-apply-link"
        >
          Candidatar-se
        </a>
      </div>
    </article>
  );
}
