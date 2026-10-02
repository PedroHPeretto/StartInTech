import {
  DynamicRoadmapNodeStatus,
  SkillPriority,
  type DynamicRoadmapNodeDto,
  type RoadmapNodeResponseDto,
  type RoadmapProgressMetricsDto,
} from '@startintech/shared';

export function buildDynamicRoadmapProgress(
  nodes: RoadmapNodeResponseDto[],
  presentSkillIds: ReadonlySet<string>,
  hasResumeAnalyzed: boolean,
): {
  nodes: DynamicRoadmapNodeDto[];
  metrics: RoadmapProgressMetricsDto;
} {
  const dynamicNodes = nodes.map((node) =>
    mapNode(node, presentSkillIds, hasResumeAnalyzed),
  );
  return {
    nodes: dynamicNodes,
    metrics: computeMetrics(dynamicNodes),
  };
}

function mapNode(
  node: RoadmapNodeResponseDto,
  presentSkillIds: ReadonlySet<string>,
  hasResumeAnalyzed: boolean,
): DynamicRoadmapNodeDto {
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    priority: node.priority,
    sequenceOrder: node.sequenceOrder,
    skillId: node.skillId,
    status: resolveStatus(node.skillId, presentSkillIds, hasResumeAnalyzed),
    children: node.children.map((child) =>
      mapNode(child, presentSkillIds, hasResumeAnalyzed),
    ),
  };
}

function resolveStatus(
  skillId: string | null,
  presentSkillIds: ReadonlySet<string>,
  hasResumeAnalyzed: boolean,
): DynamicRoadmapNodeStatus {
  if (skillId === null) {
    return DynamicRoadmapNodeStatus.NEUTRAL;
  }
  if (!hasResumeAnalyzed) {
    return DynamicRoadmapNodeStatus.PENDING;
  }
  return presentSkillIds.has(skillId)
    ? DynamicRoadmapNodeStatus.MASTERED
    : DynamicRoadmapNodeStatus.PENDING;
}

function computeMetrics(
  nodes: DynamicRoadmapNodeDto[],
): RoadmapProgressMetricsDto {
  const flat = flatten(nodes);
  const trackable = flat.filter((node) => node.skillId !== null);
  const mastered = trackable.filter(
    (node) => node.status === DynamicRoadmapNodeStatus.MASTERED,
  );
  const essentialTrackable = trackable.filter(
    (node) => node.priority === SkillPriority.ESSENTIAL,
  );
  const essentialMastered = essentialTrackable.filter(
    (node) => node.status === DynamicRoadmapNodeStatus.MASTERED,
  );

  return {
    totalTrackableNodes: trackable.length,
    masteredNodesCount: mastered.length,
    overallProgressPercentage: toPercentage(mastered.length, trackable.length),
    essentialProgressPercentage: toPercentage(
      essentialMastered.length,
      essentialTrackable.length,
    ),
  };
}

function toPercentage(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 100);
}

function flatten(nodes: DynamicRoadmapNodeDto[]): DynamicRoadmapNodeDto[] {
  const result: DynamicRoadmapNodeDto[] = [];
  const visit = (items: DynamicRoadmapNodeDto[]) => {
    for (const item of items) {
      result.push(item);
      visit(item.children);
    }
  };
  visit(nodes);
  return result;
}

export function countDescendantTrackableProgress(node: DynamicRoadmapNodeDto): {
  mastered: number;
  trackable: number;
} {
  const flat = flatten(node.children);
  const trackable = flat.filter((item) => item.skillId !== null);
  const mastered = trackable.filter(
    (item) => item.status === DynamicRoadmapNodeStatus.MASTERED,
  );
  return { mastered: mastered.length, trackable: trackable.length };
}
