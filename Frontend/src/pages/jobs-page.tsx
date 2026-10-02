import {
  JobSortBy,
  WorkplaceType,
  type JobListingDto,
} from '@startintech/shared';
import { useEffect, useState, type ReactNode } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { JobListingCard } from '@/components/cards/job-listing-card';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { FilterPills } from '@/components/ui/filter-pills';
import { SearchBar } from '@/components/ui/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { fetchJobs } from '@/jobs/jobs-api';
import { cn } from '@/lib/utils';

type JobsLoadStatus = 'loading' | 'ready' | 'error';

const WORKPLACE_FILTER_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: WorkplaceType.REMOTE, label: 'Remoto' },
  { id: WorkplaceType.HYBRID, label: 'Híbrido' },
  { id: WorkplaceType.ON_SITE, label: 'Presencial' },
] as const;

const SORT_OPTIONS = [
  { id: JobSortBy.MATCH_SCORE, label: 'Maior compatibilidade' },
  { id: JobSortBy.NEWEST, label: 'Mais recentes' },
] as const;

const JOBS_PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

function JobsPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-brand-light-gray px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <BrandHeader href={undefined} showTagline />
        </div>
        {children}
      </div>
    </main>
  );
}

function JobsSkeleton() {
  return (
    <div
      className="mt-6 space-y-3"
      data-testid="jobs-skeleton"
      aria-busy="true"
      aria-label="Carregando vagas"
    >
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

export function JobsPage() {
  const [workplaceFilter, setWorkplaceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<JobSortBy>(JobSortBy.MATCH_SCORE);
  const [onlyHighCompatibility, setOnlyHighCompatibility] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<JobListingDto[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [status, setStatus] = useState<JobsLoadStatus>('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [requestId, setRequestId] = useState(0);

  const resetToFirstPage = () => {
    setPage(1);
    setStatus('loading');
    setItems([]);
    setHasNextPage(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch((previous) => {
        if (previous !== trimmed) {
          resetToFirstPage();
        }
        return trimmed;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const isFirstPage = page === 1;

    const workplaceType =
      workplaceFilter === 'all'
        ? undefined
        : (workplaceFilter as WorkplaceType);

    fetchJobs(
      {
        page,
        limit: JOBS_PAGE_LIMIT,
        workplaceType,
        search: debouncedSearch || undefined,
        onlyHighCompatibility: onlyHighCompatibility || undefined,
        sortBy,
      },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setItems((current) =>
          isFirstPage ? data.items : [...current, ...data.items],
        );
        setHasNextPage(data.meta.hasNextPage);
        setStatus('ready');
        setIsLoadingMore(false);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        if (isFirstPage) {
          setItems([]);
          setHasNextPage(false);
        }
        setStatus('error');
        setIsLoadingMore(false);
      });

    return () => controller.abort();
  }, [
    page,
    workplaceFilter,
    debouncedSearch,
    onlyHighCompatibility,
    sortBy,
    requestId,
  ]);

  const retry = () => {
    resetToFirstPage();
    setRequestId((current) => current + 1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setWorkplaceFilter('all');
    setOnlyHighCompatibility(false);
    setSortBy(JobSortBy.MATCH_SCORE);
    resetToFirstPage();
  };

  const hasActiveFilters =
    workplaceFilter !== 'all' ||
    debouncedSearch.length > 0 ||
    onlyHighCompatibility ||
    sortBy !== JobSortBy.MATCH_SCORE;

  const showEmptyState = status === 'ready' && items.length === 0;

  return (
    <JobsPageShell>
      <h1
        className="text-center font-heading text-2xl font-bold text-brand-midnight sm:text-3xl"
        data-testid="jobs-title"
      >
        Mural de oportunidades
      </h1>
      <p className="mt-2 text-center font-sans text-sm text-slate-600">
        Vagas alinhadas à trilha da sua carreira
      </p>

      <div className="mt-8 space-y-4">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscar por cargo ou empresa..."
          aria-label="Buscar vagas"
        />
        <FilterPills
          options={[...WORKPLACE_FILTER_OPTIONS]}
          selected={workplaceFilter}
          onChange={(selected) => {
            if (typeof selected === 'string') {
              setWorkplaceFilter(selected);
              resetToFirstPage();
            }
          }}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterPills
            options={[...SORT_OPTIONS]}
            selected={sortBy}
            onChange={(selected) => {
              if (typeof selected === 'string') {
                setSortBy(selected as JobSortBy);
                resetToFirstPage();
              }
            }}
            className="flex-1"
          />
          <button
            type="button"
            aria-pressed={onlyHighCompatibility}
            onClick={() => {
              setOnlyHighCompatibility((current) => !current);
              resetToFirstPage();
            }}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-medium font-sans transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue shrink-0',
              onlyHighCompatibility
                ? 'bg-brand-blue text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
            data-testid="jobs-only-high-compatibility"
          >
            Apenas Vagas de Alta Compatibilidade
          </button>
        </div>
      </div>

      {status === 'loading' && page === 1 ? <JobsSkeleton /> : null}

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

      {showEmptyState ? (
        <div
          className="mt-8 rounded-2xl border border-border bg-brand-light-gray px-4 py-8 text-center"
          data-testid="jobs-empty"
        >
          <p className="font-sans text-sm text-slate-600">
            Nenhuma vaga encontrada com os filtros atuais.
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={clearFilters}
              data-testid="jobs-clear-filters"
            >
              Limpar filtros
            </Button>
          ) : null}
        </div>
      ) : null}

      {status === 'ready' && items.length > 0 ? (
        <div className="mt-8 flex flex-col gap-4" data-testid="jobs-list">
          {items.map((job) => (
            <JobListingCard key={job.id} job={job} />
          ))}
        </div>
      ) : null}

      {status === 'ready' && hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={isLoadingMore}
            onClick={() => {
              setIsLoadingMore(true);
              setPage((current) => current + 1);
            }}
            data-testid="jobs-load-more"
          >
            {isLoadingMore ? 'Carregando…' : 'Carregar mais'}
          </Button>
        </div>
      ) : null}
    </JobsPageShell>
  );
}
