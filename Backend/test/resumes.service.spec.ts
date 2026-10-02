import { BadRequestException, ConflictException } from '@nestjs/common';
import { ResumeSubmissionMode } from '@startintech/shared';
import { describe, expect, it, vi } from 'vitest';
import type { GcsStorageService } from '../src/resumes/gcs-storage.service.js';
import type {
  CreateResumeAnalysisParams,
  ResumeAnalysisRecord,
  ResumesRepository,
} from '../src/resumes/resumes.repository.js';
import { ResumesService } from '../src/resumes/resumes.service.js';

const AUTHENTICATED_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ANALYSIS_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

class InMemoryResumesRepository implements ResumesRepository {
  readonly records: ResumeAnalysisRecord[] = [];

  create(params: CreateResumeAnalysisParams): Promise<ResumeAnalysisRecord> {
    const existing = this.records.find((r) => r.id === params.id);
    if (existing) {
      return Promise.reject(
        new ConflictException(
          'Resume analysis already exists for this submission',
        ),
      );
    }
    const record: ResumeAnalysisRecord = {
      id: params.id,
      userId: params.userId,
      fileUrl: params.fileUrl,
      rawText: params.rawText,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    this.records.push(record);
    return Promise.resolve(record);
  }
}

function createGcsMock(): GcsStorageService {
  return {
    createSignedUploadUrl: vi.fn().mockResolvedValue({
      uploadUrl: 'https://signed.example/upload',
      expiresInSeconds: 300,
    }),
    objectExists: vi.fn().mockResolvedValue(true),
    buildFileUrl: vi
      .fn()
      .mockImplementation(
        (fileKey: string) => `gs://test-private-bucket/${fileKey}`,
      ),
  } as unknown as GcsStorageService;
}

describe('ResumesService', () => {
  it('does not persist when generating an upload URL', async () => {
    const repository = new InMemoryResumesRepository();
    const gcs = createGcsMock();
    const service = new ResumesService(repository, gcs);

    const result = await service.generateUploadUrl(AUTHENTICATED_USER_ID, {
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSizeBytes: 2048,
    });

    expect(result.uploadUrl).toBe('https://signed.example/upload');
    expect(result.fileKey).toMatch(
      new RegExp(`^resumes/${AUTHENTICATED_USER_ID}/`),
    );
    expect(result.expiresInSeconds).toBe(300);
    expect(repository.records).toHaveLength(0);
  });

  it('persists file_url only for FILE_UPLOAD submissions', async () => {
    const repository = new InMemoryResumesRepository();
    const gcs = createGcsMock();
    const service = new ResumesService(repository, gcs);
    const fileKey = `resumes/${AUTHENTICATED_USER_ID}/${ANALYSIS_ID}.pdf`;

    const result = await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.FILE_UPLOAD,
      fileKey,
    });

    expect(result.status).toBe('RECEIVED');
    expect(result.id).toBe(ANALYSIS_ID);
    expect(repository.records).toEqual([
      {
        id: ANALYSIS_ID,
        userId: AUTHENTICATED_USER_ID,
        fileUrl: `gs://test-private-bucket/${fileKey}`,
        rawText: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);
  });

  it('persists raw_text only for RAW_TEXT submissions', async () => {
    const repository = new InMemoryResumesRepository();
    const gcs = createGcsMock();
    const service = new ResumesService(repository, gcs);
    const rawText = 'a'.repeat(120);

    const result = await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.RAW_TEXT,
      rawText,
    });

    expect(result.status).toBe('RECEIVED');
    expect(repository.records).toHaveLength(1);
    expect(repository.records[0]?.fileUrl).toBeNull();
    expect(repository.records[0]?.rawText).toBe(rawText);
  });

  it('rejects a foreign file key', async () => {
    const repository = new InMemoryResumesRepository();
    const gcs = createGcsMock();
    const service = new ResumesService(repository, gcs);

    await expect(
      service.submit(AUTHENTICATED_USER_ID, {
        mode: ResumeSubmissionMode.FILE_UPLOAD,
        fileKey: `resumes/other-user/${ANALYSIS_ID}.pdf`,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.records).toHaveLength(0);
  });

  it('rejects blank raw text after trimming', async () => {
    const repository = new InMemoryResumesRepository();
    const gcs = createGcsMock();
    const service = new ResumesService(repository, gcs);

    await expect(
      service.submit(AUTHENTICATED_USER_ID, {
        mode: ResumeSubmissionMode.RAW_TEXT,
        rawText: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.records).toHaveLength(0);
  });

  it('rejects duplicate fileKey submission with ConflictException', async () => {
    const repository = new InMemoryResumesRepository();
    const gcs = createGcsMock();
    const service = new ResumesService(repository, gcs);
    const fileKey = `resumes/${AUTHENTICATED_USER_ID}/${ANALYSIS_ID}.pdf`;

    await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.FILE_UPLOAD,
      fileKey,
    });

    await expect(
      service.submit(AUTHENTICATED_USER_ID, {
        mode: ResumeSubmissionMode.FILE_UPLOAD,
        fileKey,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
