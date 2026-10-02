import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoadmapTables1759407000000 implements MigrationInterface {
  name = 'CreateRoadmapTables1759407000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "roadmap_node_priority" AS ENUM (
        'ESSENTIAL',
        'RECOMMENDED',
        'ADVANCED'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "career_roadmaps" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "career_track_id" uuid NOT NULL,
        "title" text NOT NULL,
        "description" text,
        CONSTRAINT "PK_career_roadmaps_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_career_roadmaps_career_track_id" UNIQUE ("career_track_id"),
        CONSTRAINT "FK_career_roadmaps_career_track_id"
          FOREIGN KEY ("career_track_id")
          REFERENCES "career_tracks" ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "roadmap_nodes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "career_roadmap_id" uuid NOT NULL,
        "parent_node_id" uuid,
        "skill_id" uuid,
        "title" text NOT NULL,
        "description" text,
        "priority" "roadmap_node_priority" NOT NULL,
        "sequence_order" integer NOT NULL,
        CONSTRAINT "PK_roadmap_nodes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_roadmap_nodes_career_roadmap_id"
          FOREIGN KEY ("career_roadmap_id")
          REFERENCES "career_roadmaps" ("id"),
        CONSTRAINT "FK_roadmap_nodes_parent_node_id"
          FOREIGN KEY ("parent_node_id")
          REFERENCES "roadmap_nodes" ("id"),
        CONSTRAINT "FK_roadmap_nodes_skill_id"
          FOREIGN KEY ("skill_id")
          REFERENCES "skills" ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_roadmap_nodes_career_roadmap_id"
      ON "roadmap_nodes" ("career_roadmap_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roadmap_nodes"`);
    await queryRunner.query(`DROP TABLE "career_roadmaps"`);
    await queryRunner.query(`DROP TYPE "roadmap_node_priority"`);
  }
}
