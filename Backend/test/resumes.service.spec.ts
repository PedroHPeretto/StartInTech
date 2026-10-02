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
  SeniorityLevel,
  SkillCategory,
  type FeedbackReportDto,
} from '@startintech/shared';
import { describe, expect, it, vi } from 'vitest';
import type { AiService } from '../src/ai/ai.service.js';
import type { ProfilesRepository } from '../src/profiles/profiles.repository.js';
import { AtsScoringService } from '../src/resumes/ats-scoring.service.js';
import type { GcsStorageService } from '../src/resumes/gcs-storage.service.js';
import type {
  CreateResumeAnalysisParams,
  CreateResumeAnalysisResult,
  PersistEvaluationParams,
  PersistEvaluationResult,
  PersistedSkillExtraction,
  PendingStoragePurgeRecord,
  ResumeAnalysisEvaluationRecord,
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
  readonly pendingPurges: PendingStoragePurgeRecord[] = [];
  private readonly skillsByAnalysis = new Map<string, SkillLinkInput[]>();
  private skillIdByKey = new Map<string, string>();
  private linkGenerations = 0;
  private createdAtSequence = 0;

  create(
    params: CreateResumeAnalysisParams,
  ): Promise<CreateResumeAnalysisResult> {
    const existing = this.records.find((r) => r.id === params.id);
    if (existing) {
      return Promise.reject(
        new ConflictException(
          'Resume analysis already exists for this submission',
        ),
      );
    }

    const purgedFileUrls: string[] = [];
    const userRecords = this.records
      .filter((record) => record.userId === params.userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    while (userRecords.length >= 3) {
      const oldest = userRecords.shift();
      if (!oldest) {
        break;
      }
      if (oldest.fileUrl) {
        purgedFileUrls.push(oldest.fileUrl);
      }
      this.records.splice(this.records.indexOf(oldest), 1);
      this.skillsByAnalysis.delete(oldest.id);
    }

    this.createdAtSequence += 1;
    const record: ResumeAnalysisRecord = {
      id: params.id,
      userId: params.userId,
      fileUrl: params.fileUrl,
      rawText: params.rawText,
      createdAt: new Date(`2026-01-0${this.createdAtSequence}T00:00:00.000Z`),
      atsScore: null,
      feedbackReport: null,
    };
    this.records.push(record);
    return Promise.resolve({ record, purgedFileUrls });
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

  findForEvaluation(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisEvaluationRecord | null> {
    const record = this.records.find(
      (item) => item.id === id && item.userId === userId,
    );
    if (!record) {
      return Promise.resolve(null);
    }
    const links = this.skillsByAnalysis.get(id) ?? [];
    const presentSkillNames = links
      .filter((link) => link.status === ResumeAnalysisSkillStatus.PRESENT)
      .map((link) => link.name);
    const missingSkillNames = links
      .filter((link) => link.status === ResumeAnalysisSkillStatus.MISSING_GAP)
      .map((link) => link.name);

    return Promise.resolve({
      ...record,
      atsScore: record.atsScore ?? null,
      feedbackReport: record.feedbackReport ?? null,
      presentSkillCount: presentSkillNames.length,
      missingSkillCount: missingSkillNames.length,
      presentSkillNames,
      missingSkillNames,
    });
  }

  listHistoryForUser(userId: string) {
    return Promise.resolve(
      this.records
        .filter((record) => record.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map((record, index) => ({
          id: record.id,
          atsScore: record.atsScore ?? null,
          fileUrl: record.fileUrl,
          createdAt: record.createdAt.toISOString(),
          isLatest: index === 0,
        })),
    );
  }

  persistEvaluation(
    params: PersistEvaluationParams,
  ): Promise<PersistEvaluationResult> {
    const record = this.records.find((item) => item.id === params.analysisId);
    if (!record) {
      throw new Error('missing analysis');
    }
    record.atsScore = params.atsScore;
    record.feedbackReport = params.feedbackReport;
    const activeVersionsCount = this.records.filter(
      (item) => item.userId === params.userId,
    ).length;
    return Promise.resolve({ activeVersionsCount });
  }

  listPendingStoragePurges(): Promise<PendingStoragePurgeRecord[]> {
    return Promise.resolve([...this.pendingPurges]);
  }

  recordPendingStoragePurge(fileUrl: string): Promise<void> {
    this.pendingPurges.push({
      id: `purge-${this.pendingPurges.length + 1}`,
      fileUrl,
    });
    return Promise.resolve();
  }

  deletePendingStoragePurge(id: string): Promise<void> {
    const index = this.pendingPurges.findIndex((row) => row.id === id);
    if (index >= 0) {
      this.pendingPurges.splice(index, 1);
    }
    return Promise.resolve();
  }

  persistSkillExtraction(
    resumeAnalysisId: string,
    links: SkillLinkInput[],
  ): Promise<PersistedSkillExtraction> {
    this.linkGenerations += 1;
    this.skillLinks.length = 0;
    this.skillLinks.push(...links);
    this.skillsByAnalysis.set(resumeAnalysisId, [...links]);

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
    deleteObject: vi.fn().mockResolvedValue(undefined),
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

const SAMPLE_REPORT: FeedbackReportDto = {
  summary: 'Solid foundation with room to grow.',
  strengths: ['Clear project descriptions'],
  improvements: ['Add metrics to experience bullets'],
  actionPlan: ['Quantify impact in recent roles'],
  marketReadiness: SeniorityLevel.JUNIOR,
};

function createAiMock(): AiService {
  return {
    extractSkillsFromResume: vi.fn().mockResolvedValue({
      detectedSkills: [
        { name: 'TypeScript', category: SkillCategory.LANGUAGE },
      ],
      missingSkills: [{ name: 'Docker', category: SkillCategory.TOOL }],
      insufficientText: false,
    }),
    generatePedagogicalFeedback: vi.fn().mockResolvedValue(SAMPLE_REPORT),
  } as unknown as AiService;
}

function createService() {
  const repository = new InMemoryResumesRepository();
  const gcs = createGcsMock();
  const profiles = createProfilesMock();
  const ai = createAiMock();
  const atsScoring = new AtsScoringService();
  const service = new ResumesService(repository, profiles, gcs, ai, atsScoring);
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
        atsScore: null,
        feedbackReport: null,
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

    (
      ai.extractSkillsFromResume as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
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
    (
      ai.extractSkillsFromResume as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      detectedSkills: [],
      missingSkills: [],
      insufficientText: true,
    });

    await expect(
      service.extractSkills(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('drops the oldest analysis on the fourth submission', async () => {
    const { service, repository } = createService();
    const rawText = 'a'.repeat(120);
    const firstId = '11111111-1111-4111-8111-111111111111';
    const secondId = '22222222-2222-4222-8222-222222222222';
    const thirdId = '33333333-3333-4333-8333-333333333333';
    repository.records.push(
      {
        id: firstId,
        userId: AUTHENTICATED_USER_ID,
        fileUrl: 'gs://test-private-bucket/resumes/old-1.pdf',
        rawText: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: secondId,
        userId: AUTHENTICATED_USER_ID,
        fileUrl: null,
        rawText: 'b'.repeat(120),
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        id: thirdId,
        userId: AUTHENTICATED_USER_ID,
        fileUrl: null,
        rawText: 'c'.repeat(120),
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    );

    await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.RAW_TEXT,
      rawText,
    });

    expect(repository.records).toHaveLength(3);
    expect(repository.records.map((record) => record.id)).toEqual([
      secondId,
      thirdId,
      repository.records[2]?.id,
    ]);
    expect(repository.records.some((record) => record.id === firstId)).toBe(
      false,
    );
  });

  it('returns 409 when evaluating a resume without extracted skills', async () => {
    const { service, repository } = createService();
    repository.records.push({
      id: ANALYSIS_ID,
      userId: AUTHENTICATED_USER_ID,
      fileUrl: null,
      rawText: 'a'.repeat(120),
      createdAt: new Date(),
    });

    await expect(
      service.evaluate(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns 404 when evaluating a resume owned by another user', async () => {
    const { service, repository } = createService();
    repository.records.push({
      id: ANALYSIS_ID,
      userId: 'other-user-id',
      fileUrl: null,
      rawText: 'a'.repeat(120),
      createdAt: new Date(),
    });

    await expect(
      service.evaluate(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not call the model when a feedback report already exists', async () => {
    const { service, repository, ai } = createService();
    repository.records.push({
      id: ANALYSIS_ID,
      userId: AUTHENTICATED_USER_ID,
      fileUrl: null,
      rawText: 'a'.repeat(120),
      createdAt: new Date(),
      atsScore: 72,
      feedbackReport: SAMPLE_REPORT,
    });
    repository.skillsByAnalysis.set(ANALYSIS_ID, [
      {
        name: 'TypeScript',
        category: SkillCategory.LANGUAGE,
        status: ResumeAnalysisSkillStatus.PRESENT,
      },
    ]);

    const result = await service.evaluate(AUTHENTICATED_USER_ID, ANALYSIS_ID);

    expect(ai.generatePedagogicalFeedback).not.toHaveBeenCalled();
    expect(result.atsScore).toBe(72);
    expect(result.report).toEqual(SAMPLE_REPORT);
  });

  it('keeps the database delete when cloud storage purge fails', async () => {
    const { service, repository, gcs } = createService();
    const purgedUrl = 'gs://test-private-bucket/resumes/old.pdf';
    repository.records.push(
      {
        id: '11111111-1111-4111-8111-111111111111',
        userId: AUTHENTICATED_USER_ID,
        fileUrl: purgedUrl,
        rawText: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        userId: AUTHENTICATED_USER_ID,
        fileUrl: null,
        rawText: 'b'.repeat(120),
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        userId: AUTHENTICATED_USER_ID,
        fileUrl: null,
        rawText: 'c'.repeat(120),
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    );
    (gcs.deleteObject as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('GCS down'),
    );

    await service.submit(AUTHENTICATED_USER_ID, {
      mode: ResumeSubmissionMode.RAW_TEXT,
      rawText: 'd'.repeat(120),
    });

    expect(
      repository.records.some((record) => record.fileUrl === purgedUrl),
    ).toBe(false);
    expect(repository.pendingPurges).toEqual([
      { id: 'purge-1', fileUrl: purgedUrl },
    ]);
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
    (
      ai.extractSkillsFromResume as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(
      new BadGatewayException('Skill extraction provider unavailable'),
    );

    await expect(
      service.extractSkills(AUTHENTICATED_USER_ID, ANALYSIS_ID),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
