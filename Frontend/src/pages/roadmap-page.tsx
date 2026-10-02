import {
  SkillPriority,
  type RoadmapDetailResponseDto,
  type RoadmapNodeResponseDto,
} from '@startintech/shared';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchMyTrackRoadmap } from '@/roadmaps/roadmap-api';

type RoadmapLoadStatus = 'loading' | 'ready' | 'missing' | 'error';

const PRIORITY_BADGE: Record<
  SkillPriority,
  { label: string; className: string }
> = {
  [SkillPriority.ESSENTIAL]: {
    label: 'Essencial',
    className:
      'border-brand-blue bg-brand-blue font-semibold text-white hover:bg-brand-blue',
  },
  [SkillPriority.RECOMMENDED]: {
    label: 'Recomendado',
    className:
      'border-slate-200 bg-white font-medium text-slate-600 hover:bg-white',
  },
  [SkillPriority.ADVANCED]: {
    label: 'Avançado',
    className:
      'border-brand-midnight/25 bg-transparent font-semibold text-brand-midnight hover:bg-transparent',
  },
};

function RoadmapPriorityBadge({ priority }: { priority: SkillPriority }) {
  const presentation = PRIORITY_BADGE[priority];

  return (
    <Badge className={cn('shrink-0', presentation.className)}>
      {presentation.label}
    </Badge>
  );
}

function RoadmapNodeHeading({
  node,
  expandable,
  open,
}: {
  node: RoadmapNodeResponseDto;
  expandable: boolean;
  open: boolean;
}) {
  return (
    <div className="flex w-full items-start gap-3 text-left">
      {expandable ? (
        <ChevronDown
          aria-hidden
          className={cn(
            'mt-1 size-4 shrink-0 text-brand-blue transition-transform',
            open && 'rotate-180',
          )}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-heading text-base font-bold text-brand-midnight">
          {node.title}
        </p>
        {node.description ? (
          <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
            {node.description}
          </p>
        ) : null}
      </div>
      <RoadmapPriorityBadge priority={node.priority} />
    </div>
  );
}

function RoadmapNodeItem({ node }: { node: RoadmapNodeResponseDto }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const childrenId = `roadmap-children-${node.id}`;

  return (
    <li
      className="rounded-2xl border border-border bg-white p-4 shadow-2xs"
      data-testid="roadmap-node"
      data-node-id={node.id}
    >
      {hasChildren ? (
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          aria-expanded={open}
          aria-controls={childrenId}
          onClick={() => setOpen((current) => !current)}
        >
          <RoadmapNodeHeading node={node} expandable open={open} />
        </button>
      ) : (
        <RoadmapNodeHeading node={node} expandable={false} open={false} />
      )}

      {hasChildren && open ? (
        <ul
          id={childrenId}
          data-testid="roadmap-node-children"
          className="mt-3 flex flex-col gap-3 border-l-2 border-brand-blue/25 pl-3 sm:pl-5"
        >
          {node.children.map((child) => (
            <RoadmapNodeItem key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function RoadmapSkeleton() {
  return (
    <div
      className="mt-8 space-y-3"
      data-testid="roadmap-skeleton"
      aria-busy="true"
      aria-label="Carregando trilha de carreira"
    >
      <Skeleton className="mx-auto h-8 w-2/3 max-w-md" />
      <Skeleton className="mx-auto h-4 w-48" />
      <div className="flex flex-col gap-3 pt-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function RoadmapPageShell({ children }: { children: ReactNode }) {
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

export function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapDetailResponseDto | null>(null);
  const [status, setStatus] = useState<RoadmapLoadStatus>('loading');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchMyTrackRoadmap(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setRoadmap(data);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setRoadmap(null);
          setStatus('missing');
          return;
        }
        setRoadmap(null);
        setStatus('error');
      });

    return () => controller.abort();
  }, [requestId]);

  const retry = () => {
    setRoadmap(null);
    setStatus('loading');
    setRequestId((current) => current + 1);
  };

  return (
    <RoadmapPageShell>
      {status === 'loading' ? <RoadmapSkeleton /> : null}

      {status === 'missing' ? (
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-brand-midnight">
            Trilha de carreira
          </h1>
          <p
            className="mt-6 rounded-2xl border border-border bg-brand-light-gray px-4 py-6 font-sans text-sm text-slate-600"
            data-testid="roadmap-missing"
          >
            Trilha ainda não disponível para a sua carreira.
          </p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-2">
          <h1 className="text-center font-heading text-2xl font-bold text-brand-midnight">
            Trilha de carreira
          </h1>
          <div className="mt-6">
            <AlertBanner
              variant="warning"
              message="Não foi possível carregar a trilha. Tente novamente."
              actionLabel="Tentar novamente"
              onAction={retry}
            />
          </div>
        </div>
      ) : null}

      {status === 'ready' && roadmap ? (
        <div>
          <h1
            className="text-center font-heading text-2xl font-bold text-brand-midnight sm:text-3xl"
            data-testid="roadmap-title"
          >
            {roadmap.title}
          </h1>
          <p className="mt-3 text-center font-sans text-sm text-slate-600">
            Carreira:{' '}
            <span
              className="font-semibold text-brand-blue"
              data-testid="roadmap-career-name"
            >
              {roadmap.careerTrack.name}
            </span>
          </p>
          {roadmap.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-center font-sans text-sm leading-relaxed text-muted-foreground">
              {roadmap.description}
            </p>
          ) : null}

          <ul className="mt-8 flex flex-col gap-3">
            {roadmap.nodes.map((node) => (
              <RoadmapNodeItem key={node.id} node={node} />
            ))}
          </ul>
        </div>
      ) : null}
    </RoadmapPageShell>
  );
}
