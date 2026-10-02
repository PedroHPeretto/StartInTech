import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ResumeAnalysisSkillStatus,
  ResumeSubmissionMode,
  SkillCategory,
} from '@startintech/shared';
import { describe, expect, it, vi } from 'vitest';
import type { AiService } from '../src/ai/ai.service.js';
import type { ProfilesRepository } from '../src/profiles/profiles.repository.js';
import type { GcsStorageService } from '../src/resumes/gcs-storage.service.js';
import type {
  CreateResumeAnalysisParams,
  PersistedSkillExtraction,
  ResumeAnalysisRecord,
  ResumesRepository,
  SkillLinkInput,
} from '../src/resumes/resumes.repository.js';
import { ResumesService } from '../src/resumes/resumes.service.js';

const AUTHENTICATED_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ANALYSIS_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CAREER_TRACK_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const SKILL_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

class InMemoryResumesRepository implements ResumesRepository {
  readonly records: ResumeAnalysisRecord[] = [];
  readonly skillLinks: SkillLinkInput[] = [];
  private skillIdByKey = new Map<string, string>();
  private linkGenerations = 0;

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

  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisRecord | null> {
    const record = this.records.find(
      (item) => item.id === id && item.userId === userId,
    );
    return Promise.resolve(record ?? null);
  }

  findLatestPresentSkills(userId: string) {
    return Promise.resolve({
      hasResumeAnalyzed: false,
      presentSkillIds: [] as string[],
    });
  }

  persistSkillExtraction(
    resumeAnalysisId: string,
    links: SkillLinkInput[],
  ): Promise<PersistedSkillExtraction> {
    this.linkGenerations += 1;
    this.skillLinks.length = 0;
    this.skillLinks.push(...links);

    const detected = [];
    const missing = [];

    for (const link of links) {
      const key = link.name.toLowerCase();
      let id = this.skillIdByKey.get(key);
      if (!id) {
        id = `${SKILL_ID}-${this.skillIdByKey.size}`;
        this.skillIdByKey.set(key, id);
      }
      const dto = { id, name: link.name, category: link.category };
      if (link.status === ResumeAnalysisSkillStatus.PRESENT) {
        detected.push(dto);
      } else {
        missing.push(dto);
      }
    }

    return Promise.resolve({ detected, missing });
  }

  get linkGenerationCount(): number {
    return this.linkGenerations;
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
    parseFileKeyFromGsUrl: vi
      .fn()
      .mockImplementation((fileUrl: string) =>
        fileUrl.replace('gs://test-private-bucket/', ''),
      ),
    downloadObject: vi.fn(),
  } as unknown as GcsStorageService;
}

function createProfilesMock(): ProfilesRepository {
  return {
    findByUserId: vi.fn().mockResolvedValue({
      id: 'profile-1',
      userId: AUTHENTICATED_USER_ID,
      fullName: 'Test User',
      seniorityLevel: 'JUNIOR',
      bio: null,
      careerTrack: {
        id: CAREER_TRACK_ID,
        name: 'Full Stack',
        slug: 'full-stack',
      },
    }),
    findCareerTrackById: vi.fn().mockResolvedValue({
      id: CAREER_TRACK_ID,
      slug: 'full-stack',
      name: 'Full Stack',
      description: 'Build web applications',
    }),
    create: vi.fn(),
  };
}

function createAiMock(): AiService {
  return {
    extractSkillsFromResume: vi.fn().mockResolvedValue({
      detectedSkills: [
        { name: 'TypeScript', category: SkillCategory.LANGUAGE },
      ],
      missingSkills: [{ name: 'Docker', category: SkillCategory.TOOL }],
      insufficientText: false,
    }),
  } as unknown as AiService;
}

function createService() {
  const repository = new InMemoryResumesRepository();
  const gcs = createGcsMock();
  const profiles = createProfilesMock();
  const ai = createAiMock();
  const service = new ResumesService(repository, profiles, gcs, ai);
  return { service, repository, gcs, profiles, ai };
}

describe('ResumesService', () => {
  it('does not persist when generating an upload URL', async () => {
    const { service, repository } = createService();

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
    const { service, repository } = createService();
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
    const { service, repository } = createService();
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
    const { service, repository } = createService();

    await expect(
      service.submit(AUTHENTICATED_USER_ID, {
        mode: ResumeSubmissionMode.FILE_UPLOAD,
        fileKey: `resumes/other-user/${ANALYSIS_ID}.pdf`,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.records).toHaveLength(0);
  });

  it('rejects blank raw text after trimming', async () => {
    const { service, repository } = createService();

    await expect(
      service.submit(AUTHENTICATED_USER_ID, {
        mode: ResumeSubmissionMode.RAW_TEXT,
        rawText: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.records).toHaveLength(0);
  });

  it('rejects duplicate fileKey submission with ConflictException', async () => {
    const { service, repository } = createService();
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
    expect(repository.records).toHaveLength(1);
  });

  it('inserts a skill once and reuses it on re-analysis', async () => {
    const { service, repository, ai } = createService();
    const rawText = 'a'.repeat(120);
    await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.RAW_TEXT,
      rawText,
    });
    const resumeId = repository.records[0]?.id;
    if (!resumeId) {
      throw new Error('missing resume id');
    }

    const first = await service.extractSkills(AUTHENTICATED_USER_ID, resumeId);
    expect(first.skills.detected[0]?.name).toBe('TypeScript');

    vi.mocked(ai.extractSkillsFromResume).mockResolvedValueOnce({
      detectedSkills: [
        { name: 'typescript', category: SkillCategory.LANGUAGE },
      ],
      missingSkills: [],
      insufficientText: false,
    });

    const second = await service.extractSkills(AUTHENTICATED_USER_ID, resumeId);
    expect(second.skills.detected[0]?.id).toBe(first.skills.detected[0]?.id);
    expect(repository.linkGenerationCount).toBe(2);
  });

  it('replaces previous skill links on re-analysis', async () => {
    const { service, repository } = createService();
    const rawText = 'a'.repeat(120);
    await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.RAW_TEXT,
      rawText,
    });
    const resumeId = repository.records[0]?.id;
    if (!resumeId) {
      throw new Error('missing resume id');
    }

    await service.extractSkills(AUTHENTICATED_USER_ID, resumeId);
    expect(repository.skillLinks).toHaveLength(2);

    await service.extractSkills(AUTHENTICATED_USER_ID, resumeId);
    expect(repository.skillLinks).toHaveLength(2);
    expect(repository.linkGenerationCount).toBe(2);
  });

  it('returns 404 when the resume is missing or owned by another user', async () => {
    const { service } = createService();

    await expect(
      service.extractSkills(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns 422 when resume text is too short', async () => {
    const { service, repository } = createService();
    repository.records.push({
      id: ANALYSIS_ID,
      userId: AUTHENTICATED_USER_ID,
      fileUrl: null,
      rawText: 'short',
      createdAt: new Date(),
    });

    await expect(
      service.extractSkills(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('returns 422 when the model flags insufficient text', async () => {
    const { service, repository, ai } = createService();
    repository.records.push({
      id: ANALYSIS_ID,
      userId: AUTHENTICATED_USER_ID,
      fileUrl: null,
      rawText: 'a'.repeat(120),
      createdAt: new Date(),
    });
    vi.mocked(ai.extractSkillsFromResume).mockResolvedValueOnce({
      detectedSkills: [],
      missingSkills: [],
      insufficientText: true,
    });

    await expect(
      service.extractSkills(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('returns 502 when the AI provider fails', async () => {
    const { service, repository, ai } = createService();
    repository.records.push({
      id: ANALYSIS_ID,
      userId: AUTHENTICATED_USER_ID,
      fileUrl: null,
      rawText: 'a'.repeat(120),
      createdAt: new Date(),
    });
    vi.mocked(ai.extractSkillsFromResume).mockRejectedValueOnce(
      new BadGatewayException('Skill extraction provider unavailable'),
    );

    await expect(
      service.extractSkills(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
