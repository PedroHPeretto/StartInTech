import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ResumeHistoryRetention1759407000000 implements MigrationInterface {
  name = 'ResumeHistoryRetention1759407000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_resume_analyses_user_id_created_at"
      ON "resume_analyses" ("user_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE TABLE "pending_storage_purges" (
        "id" uuid NOT NULL,
        "file_url" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pending_storage_purges_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pending_storage_purges"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_resume_analyses_user_id_created_at"`,
    );
  }
}
