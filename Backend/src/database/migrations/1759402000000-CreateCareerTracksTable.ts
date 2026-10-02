import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCareerTracksTable1759402000000 implements MigrationInterface {
  name = 'CreateCareerTracksTable1759402000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "career_tracks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "slug" text NOT NULL,
        "name" text NOT NULL,
        "description" text NOT NULL,
        CONSTRAINT "PK_career_tracks_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_career_tracks_slug" UNIQUE ("slug")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "career_tracks"`);
  }
}
