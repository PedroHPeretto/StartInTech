import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfilesTable1759404000000 implements MigrationInterface {
  name = 'CreateProfilesTable1759404000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "full_name" text NOT NULL,
        "career_track_id" uuid NOT NULL,
        "seniority_level" text NOT NULL,
        "bio" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "CHK_profiles_seniority_level" CHECK (
          "seniority_level" IN ('INTERNSHIP', 'JUNIOR')
        ),
        CONSTRAINT "FK_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
        CONSTRAINT "FK_profiles_career_track_id" FOREIGN KEY ("career_track_id") REFERENCES "career_tracks" ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profiles"`);
  }
}
