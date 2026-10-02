import {
  WorkplaceType,
  type JobOpportunityDto,
} from '@startintech/shared';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { JobCard } from '@/components/cards/job-card';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { FilterPills } from '@/components/ui/filter-pills';
import { SearchBar } from '@/components/ui/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkModeType } from '@/components/ui/badge';
import { fetchJobs } from '@/jobs/job-api';

type JobsLoadStatus = 'loading' | 'ready' | 'error';

const WORKPLACE_FILTERS = [
  { id: 'ALL', label: 'Todas' },
  { id: WorkplaceType.REMOTE, label: 'Remoto' },
  { id: WorkplaceType.HYBRID, label: 'Híbrido' },
  { id: WorkplaceType.ON_SITE, label: 'Presencial' },
];

function toWorkMode(type: WorkplaceType): WorkModeType {
  return type;
}

function JobsSkeleton() {
  return (
    <div
      className="mt-8 space-y-3"
      data-testid="jobs-skeleton"
      aria-busy="true"
      aria-label="Carregando vagas"
    >
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

export function JobsPage() {
  const [jobs, setJobs] = useState<JobOpportunityDto[]>([]);
  const [status, setStatus] = useState<JobsLoadStatus>('loading');
  const [searchInput, setSearchInput] = useState('');
  const [appliedTechnology, setAppliedTechnology] = useState<string | undefined>();
  const [workplaceFilter, setWorkplaceFilter] = useState('ALL');
  const [requestId, setRequestId] = useState(0);

  const workplaceType = useMemo(() => {
    if (workplaceFilter === 'ALL') {
      return undefined;
    }
    return workplaceFilter as WorkplaceType;
  }, [workplaceFilter]);

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(
      {
        technology: appliedTechnology,
        workplaceType,
      },
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }
        setJobs(response.jobs);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (axios.isAxiosError(error)) {
          setJobs([]);
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [appliedTechnology, workplaceType, requestId]);

  const retry = () => {
    setJobs([]);
    setStatus('loading');
    setRequestId((current) => current + 1);
  };

  const openApplyUrl = (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    if (job?.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const runSearch = () => {
    const trimmed = searchInput.trim();
    setAppliedTechnology(trimmed || undefined);
    setStatus('loading');
    setRequestId((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-brand-light-gray px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <BrandHeader href={undefined} showTagline />
        </div>

        <h1 className="text-center font-heading text-2xl font-bold text-brand-midnight sm:text-3xl">
          Vagas para você
        </h1>
        <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
          Oportunidades alinhadas à sua carreira e senioridade.
        </p>

        {status === 'loading' ? <JobsSkeleton /> : null}

        {status === 'error' ? (
          <div className="mt-6">
            <AlertBanner
              variant="warning"
              message="Não foi possível carregar as vagas. Tente novamente."
              actionLabel="Tentar novamente"
              onAction={retry}
            />
          </div>
        ) : null}

        {status === 'ready' ? (
          <div className="mt-8 space-y-4">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={runSearch}
              onClear={() => {
                setSearchInput('');
                setAppliedTechnology(undefined);
                setStatus('loading');
                setRequestId((current) => current + 1);
              }}
              placeholder="Buscar por tecnologia ou palavra-chave..."
            />

            <FilterPills
              options={WORKPLACE_FILTERS}
              selected={workplaceFilter}
              onChange={(selected) => {
                setWorkplaceFilter(
                  typeof selected === 'string' ? selected : selected[0] ?? 'ALL',
                );
                setStatus('loading');
                setRequestId((current) => current + 1);
              }}
            />

            {jobs.length === 0 ? (
              <p
                className="rounded-2xl border border-border bg-brand-light-gray px-4 py-6 text-center font-sans text-sm text-slate-600"
                data-testid="jobs-empty"
              >
                Nenhuma vaga encontrada com os filtros atuais.
              </p>
            ) : (
              <ul className="flex flex-col gap-3" data-testid="jobs-list">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <JobCard
                      id={job.id}
                      title={job.title}
                      company={job.company}
                      location={job.location}
                      workMode={toWorkMode(job.workplaceType)}
                      matchScore={job.matchScore}
                      onViewDetails={openApplyUrl}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
