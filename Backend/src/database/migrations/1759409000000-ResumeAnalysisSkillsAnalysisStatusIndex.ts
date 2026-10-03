import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ResumeAnalysisSkillsAnalysisStatusIndex1759409000000 implements MigrationInterface {
  name = 'ResumeAnalysisSkillsAnalysisStatusIndex1759409000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_resume_analysis_skills_analysis_id_status"
      ON "resume_analysis_skills" ("resume_analysis_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_resume_analysis_skills_analysis_id_status"
    `);
  }
}
