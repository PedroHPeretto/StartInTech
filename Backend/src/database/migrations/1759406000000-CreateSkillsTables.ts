import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSkillsTables1759406000000 implements MigrationInterface {
  name = 'CreateSkillsTables1759406000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "skill_category" AS ENUM (
        'LANGUAGE',
        'FRAMEWORK',
        'DATABASE',
        'TOOL',
        'SOFT_SKILL'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "resume_skill_status" AS ENUM (
        'PRESENT',
        'MISSING_GAP'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "category" "skill_category" NOT NULL,
        CONSTRAINT "PK_skills_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_skills_name_normalized"
      ON "skills" (lower(btrim("name")))
    `);
    await queryRunner.query(`
      CREATE TABLE "resume_analysis_skills" (
        "resume_analysis_id" uuid NOT NULL,
        "skill_id" uuid NOT NULL,
        "status" "resume_skill_status" NOT NULL,
        CONSTRAINT "PK_resume_analysis_skills" PRIMARY KEY (
          "resume_analysis_id",
          "skill_id",
          "status"
        ),
        CONSTRAINT "FK_resume_analysis_skills_resume_analysis_id"
          FOREIGN KEY ("resume_analysis_id")
          REFERENCES "resume_analyses" ("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_resume_analysis_skills_skill_id"
          FOREIGN KEY ("skill_id")
          REFERENCES "skills" ("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "resume_analysis_skills"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_skills_name_normalized"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TYPE "resume_skill_status"`);
    await queryRunner.query(`DROP TYPE "skill_category"`);
  }
}
