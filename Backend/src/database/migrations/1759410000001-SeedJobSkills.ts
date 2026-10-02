import type { MigrationInterface, QueryRunner } from 'typeorm';

const SKILL_IDS = {
  javascript: 'a1000001-0001-4001-8001-000000000001',
  typescript: 'a1000002-0002-4002-8002-000000000002',
  react: 'a1000003-0003-4003-8003-000000000003',
  node: 'a1000004-0004-4004-8004-000000000004',
  sql: 'a1000005-0005-4005-8005-000000000005',
} as const;

const JOB_IDS = {
  fullStack: 'b2000001-0001-4001-8001-000000000001',
  frontend: 'b2000002-0002-4002-8002-000000000002',
  backend: 'b2000003-0003-4003-8003-000000000003',
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
        ON CONFLICT ("id") DO NOTHING
      `,
      [
        SKILL_IDS.javascript,
        SKILL_IDS.typescript,
        SKILL_IDS.react,
        SKILL_IDS.node,
        SKILL_IDS.sql,
      ],
    );

    await queryRunner.query(
      `
        INSERT INTO "job_opportunities" (
          "id",
          "title",
          "company",
          "location",
          "workplace_type",
          "career_track_id",
          "description",
          "application_url",
          "is_active",
          "created_at"
        )
        SELECT seed.id, seed.title, seed.company, seed.location, seed.workplace_type,
               career_track."id", seed.description, seed.application_url, true, seed.created_at
        FROM (
          VALUES
            ($1::uuid, $2::text, $3::text, $4::text, $5::"workplace_type", $6::text, $7::text, $8::timestamptz),
            ($9::uuid, $10::text, $11::text, $12::text, $13::"workplace_type", $14::text, $15::text, $16::timestamptz),
            ($17::uuid, $18::text, $19::text, $20::text, $21::"workplace_type", $22::text, $23::text, $24::timestamptz)
        ) AS seed(id, title, company, location, workplace_type, description, application_url, created_at)
        INNER JOIN "career_tracks" AS career_track
          ON career_track."slug" = 'software-development'
        ON CONFLICT ("application_url") DO NOTHING
      `,
      [
        JOB_IDS.fullStack,
        'Desenvolvedor Full Stack Júnior',
        'StartInTech Labs',
        'São Paulo',
        'HYBRID',
        'Vaga com requisitos mandatórios e desejáveis para match score.',
        'https://startintech.local/jobs/seed-full-stack',
        '2025-09-01T12:00:00.000Z',
        JOB_IDS.frontend,
        'Desenvolvedor Frontend Júnior',
        'UI Forge',
        'Remoto',
        'REMOTE',
        'Foco em React e TypeScript.',
        'https://startintech.local/jobs/seed-frontend',
        '2025-09-15T12:00:00.000Z',
        JOB_IDS.backend,
        'Desenvolvedor Backend Júnior',
        'API Works',
        'São Paulo',
        'ON_SITE',
        'Node.js e bancos relacionais.',
        'https://startintech.local/jobs/seed-backend',
        '2025-10-01T12:00:00.000Z',
      ],
    );

    await queryRunner.query(
      `
        INSERT INTO "job_skills" ("job_id", "skill_id", "is_mandatory")
        VALUES
          ($1, $2, true),
          ($1, $3, false),
          ($1, $4, false),
          ($5, $3, true),
          ($5, $2, true),
          ($6, $7, true),
          ($6, $8, true),
          ($6, $9, false)
        ON CONFLICT ("job_id", "skill_id") DO NOTHING
      `,
      [
        JOB_IDS.fullStack,
        SKILL_IDS.javascript,
        SKILL_IDS.react,
        SKILL_IDS.node,
        JOB_IDS.frontend,
        SKILL_IDS.react,
        SKILL_IDS.typescript,
        JOB_IDS.backend,
        SKILL_IDS.node,
        SKILL_IDS.sql,
        SKILL_IDS.javascript,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM "job_skills"
        WHERE "job_id" IN ($1, $2, $3)
      `,
      [JOB_IDS.fullStack, JOB_IDS.frontend, JOB_IDS.backend],
    );
    await queryRunner.query(
      `
        DELETE FROM "job_opportunities"
        WHERE "application_url" IN ($1, $2, $3)
      `,
      [
        'https://startintech.local/jobs/seed-full-stack',
        'https://startintech.local/jobs/seed-frontend',
        'https://startintech.local/jobs/seed-backend',
      ],
    );
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
