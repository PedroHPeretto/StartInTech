import type { MigrationInterface, QueryRunner } from 'typeorm';
import {
  CANONICAL_SKILL_DEFINITIONS,
  ROADMAP_NODE_SEEDS,
} from '../../roadmaps/roadmap.catalog.js';

export class LinkRoadmapNodesToSkills1759411000000 implements MigrationInterface {
  name = 'LinkRoadmapNodesToSkills1759411000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure all canonical skills exist in the skills table
    const skillValues: string[] = [];
    const skillParams: string[] = [];
    CANONICAL_SKILL_DEFINITIONS.forEach((def, index) => {
      const offset = index * 2;
      skillValues.push(
        `(gen_random_uuid(), $${offset + 1}::text, $${offset + 2}::"skill_category")`,
      );
      skillParams.push(def.name, def.category);
    });

    await queryRunner.query(
      `
        INSERT INTO "skills" ("id", "name", "category")
        VALUES ${skillValues.join(', ')}
        ON CONFLICT (lower(btrim("name"))) DO NOTHING
      `,
      skillParams,
    );

    // 2. Link roadmap nodes to their respective skill IDs
    const trackableNodes = ROADMAP_NODE_SEEDS.filter(
      (node) => node.skillName !== null && node.skillName !== undefined,
    );

    if (trackableNodes.length > 0) {
      const nodeValues: string[] = [];
      const nodeParams: string[] = [];
      trackableNodes.forEach((node, index) => {
        const offset = index * 2;
        nodeValues.push(`($${offset + 1}::uuid, $${offset + 2}::text)`);
        nodeParams.push(node.id, node.skillName!);
      });

      await queryRunner.query(
        `
          UPDATE "roadmap_nodes" AS r
          SET "skill_id" = s."id"
          FROM (
            VALUES ${nodeValues.join(', ')}
          ) AS mapping("node_id", "skill_name")
          INNER JOIN "skills" AS s
            ON lower(btrim(s."name")) = lower(btrim(mapping."skill_name"))
          WHERE r."id" = mapping."node_id"
        `,
        nodeParams,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const nodeIds = ROADMAP_NODE_SEEDS.map((node) => node.id);
    const placeholders = nodeIds
      .map((_, index) => `$${index + 1}::uuid`)
      .join(', ');

    await queryRunner.query(
      `UPDATE "roadmap_nodes" SET "skill_id" = NULL WHERE "id" IN (${placeholders})`,
      nodeIds,
    );
  }
}
