import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobOpportunitiesTable1759409000000
  implements MigrationInterface
{
  name = 'CreateJobOpportunitiesTable1759409000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "workplace_type" AS ENUM (
        'REMOTE',
        'HYBRID',
        'ON_SITE'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "job_opportunities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "company" text NOT NULL,
        "location" text NOT NULL,
        "workplace_type" "workplace_type" NOT NULL,
        "career_track_id" uuid NOT NULL,
        "description" text NOT NULL,
        "application_url" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_job_opportunities_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_job_opportunities_application_url" UNIQUE ("application_url"),
        CONSTRAINT "FK_job_opportunities_career_track_id"
          FOREIGN KEY ("career_track_id")
          REFERENCES "career_tracks" ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_job_opportunities_career_workplace_active"
      ON "job_opportunities" ("career_track_id", "workplace_type", "is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_job_opportunities_career_workplace_active"`,
    );
    await queryRunner.query(`DROP TABLE "job_opportunities"`);
    await queryRunner.query(`DROP TYPE "workplace_type"`);
  }
}
