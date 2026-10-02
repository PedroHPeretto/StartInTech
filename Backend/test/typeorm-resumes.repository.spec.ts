import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { QueryFailedError, type Repository } from 'typeorm';
import type { ResumeAnalysis } from '../src/resumes/resume-analysis.entity.js';
import { TypeOrmResumesRepository } from '../src/resumes/typeorm-resumes.repository.js';

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
    const mockRepo = {
      create: vi.fn().mockImplementation((entity) => entity),
      insert: vi.fn().mockResolvedValue({
        identifiers: [{ id: params.id }],
        generatedMaps: [{ createdAt }],
        raw: [{ created_at: createdAt.toISOString() }],
      }),
    } as unknown as Repository<ResumeAnalysis>;

    const repo = new TypeOrmResumesRepository(mockRepo);
    const result = await repo.create(params);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: params.id,
        fileUrl: params.fileUrl,
        rawText: params.rawText,
        atsScore: null,
        feedbackReport: null,
        user: { id: params.userId },
      }),
    );
    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: params.id,
      userId: params.userId,
      fileUrl: params.fileUrl,
      rawText: null,
      createdAt,
    });
  });

  it('maps a 23505 unique constraint violation to ConflictException', async () => {
    const uniqueError = new QueryFailedError(
      'INSERT ...',
      [],
      new Error('duplicate key'),
    );
    Object.assign(uniqueError, { driverError: { code: '23505' } });

    const mockRepo = {
      create: vi.fn().mockImplementation((entity) => entity),
      insert: vi.fn().mockRejectedValue(uniqueError),
    } as unknown as Repository<ResumeAnalysis>;

    const repo = new TypeOrmResumesRepository(mockRepo);

    await expect(repo.create(params)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rethrows unexpected errors', async () => {
    const unexpectedError = new Error('Database connection lost');

    const mockRepo = {
      create: vi.fn().mockImplementation((entity) => entity),
      insert: vi.fn().mockRejectedValue(unexpectedError),
    } as unknown as Repository<ResumeAnalysis>;

    const repo = new TypeOrmResumesRepository(mockRepo);

    await expect(repo.create(params)).rejects.toThrow(
      'Database connection lost',
    );
  });
});
