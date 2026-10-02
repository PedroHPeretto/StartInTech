import type { MigrationInterface, QueryRunner } from 'typeorm';
import { CAREER_TRACK_CATALOG } from '../../career-tracks/career-track.catalog.js';

export class SeedCareerTracks1759403000000 implements MigrationInterface {
  name = 'SeedCareerTracks1759403000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const values: string[] = [];
    const parameters: string[] = [];
    CAREER_TRACK_CATALOG.forEach((track, index) => {
      const offset = index * 3;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
      parameters.push(track.slug, track.name, track.description);
    });

    await queryRunner.query(
      `
        INSERT INTO "career_tracks" ("slug", "name", "description")
        VALUES ${values.join(', ')}
        ON CONFLICT ("slug") DO NOTHING
      `,
      parameters,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const placeholders = CAREER_TRACK_CATALOG.map(
      (_, index) => `$${index + 1}`,
    ).join(', ');
    await queryRunner.query(
      `DELETE FROM "career_tracks" WHERE "slug" IN (${placeholders})`,
      CAREER_TRACK_CATALOG.map((track) => track.slug),
    );
  }
}
