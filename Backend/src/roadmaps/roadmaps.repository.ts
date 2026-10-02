import type { FlatRoadmapNode } from './build-roadmap-tree.js';

export type RoadmapNodeRecord = FlatRoadmapNode;

export interface CareerRoadmapRecord {
  id: string;
  title: string;
  description: string | null;
  nodes: RoadmapNodeRecord[];
}

export interface RoadmapsRepository {
  findWithNodesByCareerTrackId(
    careerTrackId: string,
  ): Promise<CareerRoadmapRecord | null>;
}

export const ROADMAPS_REPOSITORY = Symbol('ROADMAPS_REPOSITORY');
