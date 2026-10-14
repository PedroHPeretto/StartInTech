import type { MigrationInterface, QueryRunner } from 'typeorm';

const SKILL_IDS = {
  javascript: 'a1000001-0001-4001-8001-000000000001',
  typescript: 'a1000002-0002-4002-8002-000000000002',
  react: 'a1000003-0003-4003-8003-000000000003',
  node: 'a1000004-0004-4004-8004-000000000004',
  sql: 'a1000005-0005-4005-8005-000000000005',
} as const;

export class SeedJobSkills1759410000001 implements MigrationInterface {
  name = 'SeedJobSkills1759410000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "skills" ("id", "name", "category")
        VALUES
          ($1, 'JavaScript', 'LANGUAGE'),
          ($2, 'TypeScript', 'LANGUAGE'),
          ($3, 'React', 'FRAMEWORK'),
          ($4, 'Node.js', 'FRAMEWORK'),
          ($5, 'SQL', 'DATABASE')
        ON CONFLICT DO NOTHING
      `,
      [
        SKILL_IDS.javascript,
        SKILL_IDS.typescript,
        SKILL_IDS.react,
        SKILL_IDS.node,
        SKILL_IDS.sql,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM "skills"
        WHERE "id" IN ($1, $2, $3, $4, $5)
      `,
      [
        SKILL_IDS.javascript,
        SKILL_IDS.typescript,
        SKILL_IDS.react,
        SKILL_IDS.node,
        SKILL_IDS.sql,
      ],
    );
  }
}
