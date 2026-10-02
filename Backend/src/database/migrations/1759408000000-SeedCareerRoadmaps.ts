import type { MigrationInterface, QueryRunner } from 'typeorm';
import {
  CAREER_ROADMAP_SEEDS,
  ROADMAP_NODE_SEEDS,
} from '../../roadmaps/roadmap.catalog.js';

export class SeedCareerRoadmaps1759408000000 implements MigrationInterface {
  name = 'SeedCareerRoadmaps1759408000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const roadmapValues: string[] = [];
    const roadmapParams: Array<string | null> = [];
    CAREER_ROADMAP_SEEDS.forEach((roadmap, index) => {
      const offset = index * 4;
      roadmapValues.push(
        `($${offset + 1}::uuid, $${offset + 2}::text, $${offset + 3}::text, $${offset + 4}::text)`,
      );
      roadmapParams.push(
        roadmap.id,
        roadmap.careerSlug,
        roadmap.title,
        roadmap.description,
      );
    });

    await queryRunner.query(
      `
        INSERT INTO "career_roadmaps" ("id", "career_track_id", "title", "description")
        SELECT seed.id, career_track."id", seed.title, seed.description
        FROM (
          VALUES ${roadmapValues.join(', ')}
        ) AS seed(id, slug, title, description)
        INNER JOIN "career_tracks" AS career_track
          ON career_track."slug" = seed.slug
        ON CONFLICT ("career_track_id") DO NOTHING
      `,
      roadmapParams,
    );

    const nodeValues: string[] = [];
    const nodeParams: Array<string | number | null> = [];
    ROADMAP_NODE_SEEDS.forEach((node, index) => {
      const offset = index * 7;
      nodeValues.push(
        `($${offset + 1}::uuid, $${offset + 2}::uuid, $${offset + 3}::uuid, NULL, $${offset + 4}::text, $${offset + 5}::text, $${offset + 6}::"roadmap_node_priority", $${offset + 7}::integer)`,
      );
      nodeParams.push(
        node.id,
        node.roadmapId,
        node.parentNodeId,
        node.title,
        node.description,
        node.priority,
        node.sequenceOrder,
      );
    });

    await queryRunner.query(
      `
        INSERT INTO "roadmap_nodes" (
          "id",
          "career_roadmap_id",
          "parent_node_id",
          "skill_id",
          "title",
          "description",
          "priority",
          "sequence_order"
        )
        VALUES ${nodeValues.join(', ')}
        ON CONFLICT ("id") DO NOTHING
      `,
      nodeParams,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const roadmapIds = CAREER_ROADMAP_SEEDS.map((roadmap) => roadmap.id);
    const roadmapPlaceholders = roadmapIds
      .map((_, index) => `$${index + 1}::uuid`)
      .join(', ');

    await queryRunner.query(
      `DELETE FROM "roadmap_nodes" WHERE "career_roadmap_id" IN (${roadmapPlaceholders})`,
      roadmapIds,
    );
    await queryRunner.query(
      `DELETE FROM "career_roadmaps" WHERE "id" IN (${roadmapPlaceholders})`,
      roadmapIds,
    );
  }
}
