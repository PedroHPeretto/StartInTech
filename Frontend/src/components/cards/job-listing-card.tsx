import { type JobListingDto } from '@startintech/shared';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
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
  const descriptionNeedsExpand =
    job.description.length > DESCRIPTION_EXPAND_THRESHOLD;
  const visibleDescription =
    descriptionNeedsExpand && !descriptionExpanded
      ? `${job.description.slice(0, DESCRIPTION_EXPAND_THRESHOLD)}…`
      : job.description;

  return (
    <article
      className={cn(
        'flex w-full flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs',
        className,
      )}
      data-testid="job-listing-card"
      data-job-id={job.id}
    >
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
