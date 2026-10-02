import {
  SkillPriority,
  type RoadmapLessonDto,
  type RoadmapNodeResponseDto,
} from '@startintech/shared';
import { Injectable } from '@nestjs/common';
import { buildRoadmapTree, type FlatRoadmapNode } from './build-roadmap-tree.js';

const ROADMAP_SH_BASE = 'https://roadmap.sh/api';

export const CAREER_SLUG_TO_ROADMAP_SH: Record<string, string> = {
  'software-development': 'full-stack',
  'data-analysis': 'data-analyst',
  'data-science': 'ai-data-scientist',
  'ui-ux-design': 'ux-design',
  'devops': 'devops',
  'product-management': 'product-manager',
  'quality-assurance': 'qa',
  'cybersecurity': 'cyber-security',
};

export type FetchFn = typeof fetch;

interface TreeMappingEntry {
  nodeId: string;
  text: string;
  isOptional?: boolean;
  lessonPacks?: { packId: string }[];
}

interface OfficialRoadmapResponse {
  _id?: string;
  slug?: string;
  description?: string;
  title?: { card?: string; page?: string };
}

interface LessonPackListEntry {
  _id: string;
  slug: string;
}

interface LessonPackLesson {
  _id: string;
  title: string;
  slug: string;
  description: string;
  readingTime?: { computed?: number };
  isFree?: boolean;
}

interface LessonPackDetail {
  _id: string;
  slug: string;
  lessons?: LessonPackLesson[];
  freeLessonIds?: string[];
}

export interface RoadmapShTrack {
  id: string;
  title: string;
  description: string | null;
  nodes: RoadmapNodeResponseDto[];
}

@Injectable()
export class RoadmapShClient {
  fetchImpl: FetchFn;

  constructor() {
    this.fetchImpl = fetch.bind(globalThis);
  }

  resolveRoadmapSlug(careerSlug: string): string | null {
    return CAREER_SLUG_TO_ROADMAP_SH[careerSlug] ?? null;
  }

  async fetchTrack(roadmapSlug: string): Promise<RoadmapShTrack | null> {
    const official = await this.fetchJson<OfficialRoadmapResponse>(
      `${ROADMAP_SH_BASE}/v1-official-roadmap/${roadmapSlug}`,
    );
    if (!official) {
      return null;
    }

    const mapping = await this.fetchJson<TreeMappingEntry[]>(
      `${ROADMAP_SH_BASE}/v1-roadmap-tree-mapping/${roadmapSlug}`,
    );
    if (!mapping) {
      return null;
    }

    const { flatNodes, packRefsByNodeId, depthByNodeId } =
      buildFlatNodesFromMapping(mapping);
    const nodes = buildRoadmapTree(flatNodes);
    await this.attachLessonPacks(nodes, packRefsByNodeId, depthByNodeId);

    const title =
      official.title?.page ??
      official.title?.card ??
      roadmapSlug;

    return {
      id: official._id ?? roadmapSlug,
      title,
      description: official.description ?? null,
      nodes,
    };
  }

  private async fetchJson<T>(url: string): Promise<T | null> {
    const response = await this.fetchImpl(url);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Roadmap.sh request failed: ${response.status} ${url}`);
    }
    return (await response.json()) as T;
  }

  private async attachLessonPacks(
    nodes: RoadmapNodeResponseDto[],
    packRefsByNodeId: Map<string, string[]>,
    depthByNodeId: Map<string, number>,
  ): Promise<void> {
    const packOwners = selectPackOwners(packRefsByNodeId, depthByNodeId);
    const packIds = new Set(packOwners.keys());
    if (packIds.size === 0) {
      return;
    }

    const packList =
      (await this.fetchJson<LessonPackListEntry[]>(
        `${ROADMAP_SH_BASE}/v1-list-lesson-packs`,
      )) ?? [];
    const packsById = new Map(
      packList
        .filter((pack) => packIds.has(pack._id))
        .map((pack) => [pack._id, pack]),
    );

    const lessonsByNodeId = new Map<string, RoadmapLessonDto[]>();

    for (const [packId, nodeId] of packOwners) {
      const listEntry = packsById.get(packId);
      if (!listEntry) {
        continue;
      }
      const detail = await this.fetchJson<LessonPackDetail>(
        `${ROADMAP_SH_BASE}/v1-lesson-pack/${listEntry.slug}`,
      );
      if (!detail?.lessons?.length) {
        continue;
      }
      const lessons = mapPackLessons(detail);
      const existing = lessonsByNodeId.get(nodeId) ?? [];
      lessonsByNodeId.set(nodeId, [...existing, ...lessons]);
    }

    applyLessonsToTree(nodes, lessonsByNodeId);
  }
}

function buildFlatNodesFromMapping(mapping: TreeMappingEntry[]): {
  flatNodes: FlatRoadmapNode[];
  packRefsByNodeId: Map<string, string[]>;
  depthByNodeId: Map<string, number>;
} {
  const sorted = [...mapping].sort((left, right) => {
    const leftDepth = left.text.split(' > ').length;
    const rightDepth = right.text.split(' > ').length;
    return leftDepth - rightDepth;
  });

  const pathToId = new Map<string, string>();
  const packRefsByNodeId = new Map<string, string[]>();
  const depthByNodeId = new Map<string, number>();
  const flatNodes: FlatRoadmapNode[] = [];

  let sequenceOrder = 0;
  for (const entry of sorted) {
    const parts = entry.text.split(' > ').slice(1);
    if (parts.length === 0) {
      continue;
    }
    const pathKey = parts.join(' > ');
    const parentPath = parts.slice(0, -1).join(' > ');
    const parentNodeId = parentPath
      ? (pathToId.get(parentPath) ?? null)
      : null;
    const title = parts[parts.length - 1] ?? entry.text;

    pathToId.set(pathKey, entry.nodeId);
    depthByNodeId.set(entry.nodeId, parts.length);

    if (entry.lessonPacks?.length) {
      packRefsByNodeId.set(
        entry.nodeId,
        entry.lessonPacks.map((pack) => pack.packId),
      );
    }

    flatNodes.push({
      id: entry.nodeId,
      parentNodeId,
      title,
      description: null,
      priority: entry.isOptional
        ? SkillPriority.RECOMMENDED
        : SkillPriority.ESSENTIAL,
      sequenceOrder: sequenceOrder++,
      skillId: null,
    });
  }

  return { flatNodes, packRefsByNodeId, depthByNodeId };
}

function selectPackOwners(
  packRefsByNodeId: Map<string, string[]>,
  depthByNodeId: Map<string, number>,
): Map<string, string> {
  const owners = new Map<string, string>();

  for (const [nodeId, packIds] of packRefsByNodeId) {
    const depth = depthByNodeId.get(nodeId) ?? Number.MAX_SAFE_INTEGER;
    for (const packId of packIds) {
      const currentOwner = owners.get(packId);
      if (!currentOwner) {
        owners.set(packId, nodeId);
        continue;
      }
      const currentDepth = depthByNodeId.get(currentOwner) ?? Number.MAX_SAFE_INTEGER;
      if (
        depth < currentDepth ||
        (depth === currentDepth && nodeId.localeCompare(currentOwner) < 0)
      ) {
        owners.set(packId, nodeId);
      }
    }
  }

  return owners;
}

function mapPackLessons(pack: LessonPackDetail): RoadmapLessonDto[] {
  const freeIds = new Set(pack.freeLessonIds ?? []);
  return (pack.lessons ?? []).map((lesson) => ({
    id: lesson._id,
    title: lesson.title,
    description: lesson.description,
    readingTimeMinutes: lesson.readingTime?.computed ?? 0,
    url: `https://roadmap.sh/packs/${pack.slug}/${lesson.slug}`,
    isFree: lesson.isFree ?? freeIds.has(lesson._id),
  }));
}

function applyLessonsToTree(
  nodes: RoadmapNodeResponseDto[],
  lessonsByNodeId: Map<string, RoadmapLessonDto[]>,
): void {
  for (const node of nodes) {
    const lessons = lessonsByNodeId.get(node.id);
    if (lessons?.length) {
      node.lessons = lessons;
    }
    applyLessonsToTree(node.children, lessonsByNodeId);
  }
}
