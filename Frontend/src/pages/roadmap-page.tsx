import {
  DynamicRoadmapNodeStatus,
  SkillPriority,
  type DynamicRoadmapNodeDto,
  type RoadmapProgressResponseDto,
} from '@startintech/shared';
import axios from 'axios';
import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { CareerTrailProgress } from '@/components/metrics/career-progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchMyTrackProgress } from '@/roadmaps/roadmap-api';

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

const STATUS_PRESENTATION: Record<
  DynamicRoadmapNodeStatus,
  {
    badgeLabel: string | null;
    badgeClassName: string;
    cardClassName: string;
  }
> = {
  [DynamicRoadmapNodeStatus.MASTERED]: {
    badgeLabel: 'Dominado',
    badgeClassName:
      'border-emerald-200 bg-emerald-50 font-semibold text-emerald-800 hover:bg-emerald-50',
    cardClassName: 'border-emerald-200/80 bg-emerald-50/40',
  },
  [DynamicRoadmapNodeStatus.PENDING]: {
    badgeLabel: 'Pendente de Estudo',
    badgeClassName:
      'border-amber-200 bg-amber-50 font-medium text-amber-900 hover:bg-amber-50',
    cardClassName: 'border-amber-100/90 bg-amber-50/30',
  },
  [DynamicRoadmapNodeStatus.NEUTRAL]: {
    badgeLabel: null,
    badgeClassName: '',
    cardClassName: 'border-border bg-white',
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

function countDescendantTrackable(node: DynamicRoadmapNodeDto): {
  mastered: number;
  trackable: number;
} {
  const visit = (
    items: DynamicRoadmapNodeDto[],
    acc: { mastered: number; trackable: number },
  ) => {
    for (const item of items) {
      if (item.skillId !== null) {
        acc.trackable += 1;
        if (item.status === DynamicRoadmapNodeStatus.MASTERED) {
          acc.mastered += 1;
        }
      }
      visit(item.children, acc);
    }
    return acc;
  };

  return visit(node.children, { mastered: 0, trackable: 0 });
}

function RoadmapNodeHeading({
  node,
  expandable,
  open,
}: {
  node: DynamicRoadmapNodeDto;
  expandable: boolean;
  open: boolean;
}) {
  const statusStyle = STATUS_PRESENTATION[node.status];
  const descendantProgress =
    node.status === DynamicRoadmapNodeStatus.NEUTRAL
      ? countDescendantTrackable(node)
      : null;

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
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-base font-bold text-brand-midnight">
            {node.title}
          </p>
          {node.status === DynamicRoadmapNodeStatus.MASTERED ? (
            <Check
              aria-hidden
              className="size-4 shrink-0 text-emerald-600"
              data-testid="roadmap-node-mastered-icon"
            />
          ) : null}
          {statusStyle.badgeLabel ? (
            <Badge
              className={cn('shrink-0', statusStyle.badgeClassName)}
              data-testid="roadmap-node-status-badge"
            >
              {statusStyle.badgeLabel}
            </Badge>
          ) : null}
        </div>
        {node.description ? (
          <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
            {node.description}
          </p>
        ) : null}
        {descendantProgress && descendantProgress.trackable > 0 ? (
          <p
            className="mt-2 font-sans text-xs text-slate-500"
            data-testid="roadmap-node-subtopic-progress"
          >
            {descendantProgress.mastered} de {descendantProgress.trackable}{' '}
            sub-tópicos concluídos
          </p>
        ) : null}
      </div>
      <RoadmapPriorityBadge priority={node.priority} />
    </div>
  );
}

function RoadmapNodeItem({ node }: { node: DynamicRoadmapNodeDto }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const childrenId = `roadmap-children-${node.id}`;
  const statusStyle = STATUS_PRESENTATION[node.status];

  return (
    <li
      className={cn(
        'rounded-2xl border p-4 shadow-2xs',
        statusStyle.cardClassName,
      )}
      data-testid="roadmap-node"
      data-node-id={node.id}
      data-node-status={node.status}
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
    <main className="min-h-screen bg-brand-blue px-4 py-8 sm:py-10">
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
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<RoadmapProgressResponseDto | null>(
    null,
  );
  const [status, setStatus] = useState<RoadmapLoadStatus>('loading');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchMyTrackProgress(controller.signal)
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

          {!roadmap.hasResumeAnalyzed ? (
            <div className="mt-6" data-testid="roadmap-upload-banner">
              <AlertBanner
                variant="info"
                message="Envie o seu currículo para mapear automaticamente o seu progresso nesta trilha"
                actionLabel="Enviar currículo"
                onAction={() => navigate({ to: '/curriculum/upload' })}
              />
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4">
            <CareerTrailProgress
              title="Progresso na Trilha"
              completedTopics={roadmap.metrics.masteredNodesCount}
              totalTopics={roadmap.metrics.totalTrackableNodes}
              percentage={roadmap.metrics.overallProgressPercentage}
            />
            <CareerTrailProgress
              title="Competências Essenciais Dominadas"
              percentage={roadmap.metrics.essentialProgressPercentage}
              showTopicSummary={false}
            />
          </div>

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
