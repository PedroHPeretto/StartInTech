import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  DataSource,
  QueryFailedError,
  type EntityManager,
  type Repository,
} from 'typeorm';
import { ResumeAnalysis } from '../src/resumes/resume-analysis.entity.js';
import { TypeOrmResumesRepository } from '../src/resumes/typeorm-resumes.repository.js';

function createRepository(
  manager: Partial<EntityManager>,
): TypeOrmResumesRepository {
  const dataSource = {
    transaction: vi.fn(async (fn: (em: EntityManager) => Promise<unknown>) =>
      fn(manager as EntityManager),
    ),
  } as unknown as DataSource;

  return new TypeOrmResumesRepository(
    {} as Repository<ResumeAnalysis>,
    {} as Repository<never>,
    {} as Repository<never>,
    {} as Repository<never>,
    dataSource,
  );
}

describe('TypeOrmResumesRepository', () => {
  const params = {
    id: '11111111-1111-4111-8111-111111111111',
    userId: '22222222-2222-4222-8222-222222222222',
    fileUrl:
      'gs://bucket/resumes/22222222-2222-4222-8222-222222222222/11111111-1111-4111-8111-111111111111.pdf',
    rawText: null,
  };

  it('inserts a new resume analysis record and returns the created record', async () => {
    const createdAt = new Date('2026-03-01T12:00:00.000Z');
    const manager = {
      query: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation((_entity, payload) => payload),
      insert: vi.fn().mockResolvedValue({
        identifiers: [{ id: params.id }],
        generatedMaps: [{ createdAt }],
        raw: [{ created_at: createdAt.toISOString() }],
      }),
      createQueryBuilder: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(0),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      }),
    };

    const repo = createRepository(manager);
    const result = await repo.create(params);

    expect(manager.insert).toHaveBeenCalledWith(
      ResumeAnalysis,
      expect.objectContaining({
        id: params.id,
        fileUrl: params.fileUrl,
        rawText: params.rawText,
        atsScore: null,
        feedbackReport: null,
        user: { id: params.userId },
      }),
    );
    expect(result).toEqual({
      record: {
        id: params.id,
        userId: params.userId,
        fileUrl: params.fileUrl,
        rawText: null,
        createdAt,
      },
      purgedFileUrls: [],
    });
  });

  it('maps a 23505 unique constraint violation to ConflictException', async () => {
    const uniqueError = new QueryFailedError(
      'INSERT ...',
      [],
      new Error('duplicate key'),
    );
    Object.assign(uniqueError, { driverError: { code: '23505' } });

    const manager = {
      query: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation((_entity, payload) => payload),
      insert: vi.fn().mockRejectedValue(uniqueError),
      createQueryBuilder: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(0),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      }),
    };

    const repo = createRepository(manager);

    await expect(repo.create(params)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rethrows unexpected errors', async () => {
    const unexpectedError = new Error('Database connection lost');

    const manager = {
      query: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation((_entity, payload) => payload),
      insert: vi.fn().mockRejectedValue(unexpectedError),
      createQueryBuilder: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(0),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      }),
    };

    const repo = createRepository(manager);

    await expect(repo.create(params)).rejects.toThrow(
      'Database connection lost',
    );
  });
});
