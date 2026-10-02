import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResumeAnalysesTable1759405000000
  implements MigrationInterface
{
  name = 'CreateResumeAnalysesTable1759405000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "resume_analyses" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "file_url" text,
        "raw_text" text,
        "ats_score" integer,
        "feedback_report" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resume_analyses_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_resume_analyses_ats_score" CHECK (
          "ats_score" IS NULL OR ("ats_score" >= 0 AND "ats_score" <= 100)
        ),
        CONSTRAINT "FK_resume_analyses_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_resume_analyses_user_id" ON "resume_analyses" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_resume_analyses_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "resume_analyses"`);
  }
}
