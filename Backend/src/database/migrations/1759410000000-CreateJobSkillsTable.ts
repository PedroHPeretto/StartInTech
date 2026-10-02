import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobSkillsTable1759410000000 implements MigrationInterface {
  name = 'CreateJobSkillsTable1759410000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "job_opportunities"
      ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    `);

    await queryRunner.query(`
      CREATE TABLE "job_skills" (
        "job_id" uuid NOT NULL,
        "skill_id" uuid NOT NULL,
        "is_mandatory" boolean NOT NULL,
        CONSTRAINT "PK_job_skills" PRIMARY KEY ("job_id", "skill_id"),
        CONSTRAINT "FK_job_skills_job_id"
          FOREIGN KEY ("job_id")
          REFERENCES "job_opportunities" ("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_job_skills_skill_id"
          FOREIGN KEY ("skill_id")
          REFERENCES "skills" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_job_skills_job_id"
      ON "job_skills" ("job_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_job_skills_job_id"`);
    await queryRunner.query(`DROP TABLE "job_skills"`);
    await queryRunner.query(`
      ALTER TABLE "job_opportunities" DROP COLUMN "created_at"
    `);
  }
}
