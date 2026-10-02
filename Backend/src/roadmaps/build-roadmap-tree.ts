import {
  SkillPriority,
  type RoadmapNodeResponseDto,
} from '@startintech/shared';

export interface FlatRoadmapNode {
  id: string;
  parentNodeId: string | null;
  title: string;
  description: string | null;
  priority: SkillPriority;
  sequenceOrder: number;
  skillId: string | null;
}

const PRIORITY_RANK: Record<SkillPriority, number> = {
  [SkillPriority.ESSENTIAL]: 0,
  [SkillPriority.RECOMMENDED]: 1,
  [SkillPriority.ADVANCED]: 2,
};

export function buildRoadmapTree(
  nodes: readonly FlatRoadmapNode[],
): RoadmapNodeResponseDto[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const childrenByParent = new Map<string | null, FlatRoadmapNode[]>();

  for (const node of nodes) {
    const parentIsPresent =
      node.parentNodeId !== null && byId.has(node.parentNodeId);
    const parentKey = parentIsPresent ? node.parentNodeId : null;
    const siblings = childrenByParent.get(parentKey) ?? [];
    siblings.push(node);
    childrenByParent.set(parentKey, siblings);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort(compareSiblings);
  }

  const childrenOf = (parentId: string | null): readonly FlatRoadmapNode[] =>
    childrenByParent.get(parentId) ?? [];

  const seen = new Set<string>();
  const visit = (node: FlatRoadmapNode, ancestry: Set<string>): void => {
    seen.add(node.id);
    const nextAncestry = new Set(ancestry);
    nextAncestry.add(node.id);
    for (const child of childrenOf(node.id)) {
      if (nextAncestry.has(child.id) || seen.has(child.id)) {
        continue;
      }
      visit(child, nextAncestry);
    }
  };

  const naturalRoots = childrenOf(null);
  for (const root of naturalRoots) {
    if (!seen.has(root.id)) {
      visit(root, new Set());
    }
  }

  const syntheticRoots: FlatRoadmapNode[] = [];
  const pending = [...nodes].sort(compareSiblings);
  for (const candidate of pending) {
    if (seen.has(candidate.id)) {
      continue;
    }
    syntheticRoots.push(candidate);
    visit(candidate, new Set());
  }

  const roots = [...naturalRoots, ...syntheticRoots].sort(compareSiblings);
  const emitted = new Set<string>();
  const tree: RoadmapNodeResponseDto[] = [];
  for (const root of roots) {
    if (emitted.has(root.id)) {
      continue;
    }
    tree.push(toDto(root, new Set(), emitted, childrenOf));
  }
  return tree;
}

function toDto(
  node: FlatRoadmapNode,
  ancestry: Set<string>,
  emitted: Set<string>,
  childrenOf: (parentId: string | null) => readonly FlatRoadmapNode[],
): RoadmapNodeResponseDto {
  emitted.add(node.id);
  const nextAncestry = new Set(ancestry);
  nextAncestry.add(node.id);
  const children: RoadmapNodeResponseDto[] = [];
  for (const child of childrenOf(node.id)) {
    if (nextAncestry.has(child.id) || emitted.has(child.id)) {
      continue;
    }
    children.push(toDto(child, nextAncestry, emitted, childrenOf));
  }
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    priority: node.priority,
    sequenceOrder: node.sequenceOrder,
    skillId: node.skillId,
    children,
  };
}

function compareSiblings(
  left: FlatRoadmapNode,
  right: FlatRoadmapNode,
): number {
  if (left.sequenceOrder !== right.sequenceOrder) {
    return left.sequenceOrder - right.sequenceOrder;
  }
  const priorityDelta =
    PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
  if (priorityDelta !== 0) {
    return priorityDelta;
  }
  return left.id.localeCompare(right.id);
}
