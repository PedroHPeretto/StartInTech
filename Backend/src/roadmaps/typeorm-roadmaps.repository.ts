import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillPriority } from '@startintech/shared';
import { Repository } from 'typeorm';
import { CareerRoadmap } from './career-roadmap.entity.js';
import type {
  CareerRoadmapRecord,
  RoadmapNodeRecord,
  RoadmapsRepository,
} from './roadmaps.repository.js';

interface RoadmapRow {
  roadmapId: string;
  title: string;
  description: string | null;
  nodeId: string | null;
  parentNodeId: string | null;
  nodeTitle: string | null;
  nodeDescription: string | null;
  priority: SkillPriority | null;
  sequenceOrder: number | string | null;
  skillId: string | null;
}

@Injectable()
export class TypeOrmRoadmapsRepository implements RoadmapsRepository {
  constructor(
    @InjectRepository(CareerRoadmap)
    private readonly roadmaps: Repository<CareerRoadmap>,
  ) {}

  async findWithNodesByCareerTrackId(
    careerTrackId: string,
  ): Promise<CareerRoadmapRecord | null> {
    const rows: RoadmapRow[] = await this.roadmaps.query(
      `
        SELECT
          roadmap."id" AS "roadmapId",
          roadmap."title" AS "title",
          roadmap."description" AS "description",
          node."id" AS "nodeId",
          node."parent_node_id" AS "parentNodeId",
          node."title" AS "nodeTitle",
          node."description" AS "nodeDescription",
          node."priority" AS "priority",
          node."sequence_order" AS "sequenceOrder",
          node."skill_id" AS "skillId"
        FROM "career_roadmaps" roadmap
        LEFT JOIN "roadmap_nodes" node
          ON node."career_roadmap_id" = roadmap."id"
        WHERE roadmap."career_track_id" = $1
      `,
      [careerTrackId],
    );

    const header = rows[0];
    if (!header) {
      return null;
    }

    const nodes: RoadmapNodeRecord[] = [];
    for (const row of rows) {
      if (
        row.nodeId === null ||
        row.nodeTitle === null ||
        row.priority === null ||
        row.sequenceOrder === null
      ) {
        continue;
      }
      nodes.push({
        id: row.nodeId,
        parentNodeId: row.parentNodeId,
        title: row.nodeTitle,
        description: row.nodeDescription,
        priority: row.priority,
        sequenceOrder: Number(row.sequenceOrder),
        skillId: row.skillId,
      });
    }

    return {
      id: header.roadmapId,
      title: header.title,
      description: header.description,
      nodes,
    };
  }
}
