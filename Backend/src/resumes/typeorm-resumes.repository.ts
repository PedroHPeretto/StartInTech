import {
  ResumeAnalysisSkillStatus,
  type ExtractedSkillDto,
  type ResumeHistoryItemDto,
} from '@startintech/shared';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';
import type { User } from '../users/user.entity.js';
import { PendingStoragePurge } from './pending-storage-purge.entity.js';
import { ResumeAnalysisSkill } from './resume-analysis-skill.entity.js';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import { normalizeSkillNameKey, sanitizeSkillName } from './skill-name.util.js';
import { Skill } from './skill.entity.js';
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
} from './resumes.repository.js';

const UNIQUE_VIOLATION = '23505';
const MAX_RESUME_VERSIONS = 3;

@Injectable()
export class TypeOrmResumesRepository implements ResumesRepository {
  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly analyses: Repository<ResumeAnalysis>,
    @InjectRepository(Skill)
    private readonly skills: Repository<Skill>,
    @InjectRepository(ResumeAnalysisSkill)
    private readonly analysisSkills: Repository<ResumeAnalysisSkill>,
    @InjectRepository(PendingStoragePurge)
    private readonly pendingPurges: Repository<PendingStoragePurge>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    params: CreateResumeAnalysisParams,
  ): Promise<CreateResumeAnalysisResult> {
    return this.dataSource.transaction(async (manager) => {
      await this.acquireUserLock(manager, params.userId);
      const purgedFileUrls = await this.trimExcessAnalyses(manager, params.userId);

      const entity = manager.create(ResumeAnalysis, {
        id: params.id,
        fileUrl: params.fileUrl,
        rawText: params.rawText,
        atsScore: null,
        feedbackReport: null,
        user: { id: params.userId } as User,
      });

      try {
        const insertResult = await manager.insert(ResumeAnalysis, entity);
        const rawCreatedAt =
          (insertResult.generatedMaps[0]?.createdAt as
            Date | string | undefined) ??
          (insertResult.raw[0]?.created_at as Date | string | undefined);
        const createdAt =
          rawCreatedAt instanceof Date
            ? rawCreatedAt
            : rawCreatedAt
              ? new Date(rawCreatedAt)
              : new Date();

        const record: ResumeAnalysisRecord = {
          id: entity.id,
          userId: params.userId,
          fileUrl: entity.fileUrl,
          rawText: entity.rawText,
          createdAt,
        };

        return { record, purgedFileUrls };
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictException(
            'Resume analysis already exists for this submission',
          );
        }
        throw error;
      }
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisRecord | null> {
    const analysis = await this.analyses
      .createQueryBuilder('analysis')
      .innerJoin('analysis.user', 'user')
      .where('analysis.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!analysis) {
      return null;
    }

    return this.toRecord(analysis, userId);
  }

  async findForEvaluation(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisEvaluationRecord | null> {
    const analysis = await this.analyses
      .createQueryBuilder('analysis')
      .innerJoin('analysis.user', 'user')
      .where('analysis.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!analysis) {
      return null;
    }

    const skillSnapshot = await this.skillNamesForAnalysis(analysis.id);

    return {
      ...this.toRecord(analysis, userId),
      atsScore: analysis.atsScore,
      feedbackReport: analysis.feedbackReport,
      presentSkillCount: skillSnapshot.present.length,
      missingSkillCount: skillSnapshot.missing.length,
      presentSkillNames: skillSnapshot.present,
      missingSkillNames: skillSnapshot.missing,
    };
  }

  async listHistoryForUser(userId: string): Promise<ResumeHistoryItemDto[]> {
    const rows = await this.analyses
      .createQueryBuilder('analysis')
      .innerJoin('analysis.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('analysis.createdAt', 'DESC')
      .take(MAX_RESUME_VERSIONS)
      .getMany();

    return rows.map((row, index) => ({
      id: row.id,
      atsScore: row.atsScore,
      fileUrl: row.fileUrl,
      createdAt: row.createdAt.toISOString(),
      isLatest: index === 0,
    }));
  }

  async persistSkillExtraction(
    resumeAnalysisId: string,
    links: SkillLinkInput[],
  ): Promise<PersistedSkillExtraction> {
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(ResumeAnalysisSkill, { resumeAnalysisId });

      const detected: ExtractedSkillDto[] = [];
      const missing: ExtractedSkillDto[] = [];

      for (const link of links) {
        const skill = await this.findOrCreateSkill(manager, link);
        await manager.save(
          manager.create(ResumeAnalysisSkill, {
            resumeAnalysisId,
            skillId: skill.id,
            status: link.status,
          }),
        );

        const dto: ExtractedSkillDto = {
          id: skill.id,
          name: skill.name,
          category: skill.category,
        };
        if (link.status === ResumeAnalysisSkillStatus.PRESENT) {
          detected.push(dto);
        } else {
          missing.push(dto);
        }
      }

      return { detected, missing };
    });
  }

  async persistEvaluation(
    params: PersistEvaluationParams,
  ): Promise<PersistEvaluationResult> {
    return this.dataSource.transaction(async (manager) => {
      await this.acquireUserLock(manager, params.userId);
      await this.trimExcessAnalyses(manager, params.userId);

      await manager.update(
        ResumeAnalysis,
        { id: params.analysisId },
        {
          atsScore: params.atsScore,
          feedbackReport: params.feedbackReport,
        },
      );

      const activeVersionsCount = await manager
        .createQueryBuilder(ResumeAnalysis, 'analysis')
        .innerJoin('analysis.user', 'user')
        .where('user.id = :userId', { userId: params.userId })
        .getCount();

      return {
        activeVersionsCount: Math.min(activeVersionsCount, MAX_RESUME_VERSIONS),
      };
    });
  }

  async listPendingStoragePurges(): Promise<PendingStoragePurgeRecord[]> {
    const rows = await this.pendingPurges.find({
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => ({ id: row.id, fileUrl: row.fileUrl }));
  }

  async recordPendingStoragePurge(fileUrl: string): Promise<void> {
    await this.pendingPurges.insert({
      id: randomUUID(),
      fileUrl,
    });
  }

  async deletePendingStoragePurge(id: string): Promise<void> {
    await this.pendingPurges.delete({ id });
  }

  private toRecord(
    analysis: ResumeAnalysis,
    userId: string,
  ): ResumeAnalysisRecord {
    return {
      id: analysis.id,
      userId,
      fileUrl: analysis.fileUrl,
      rawText: analysis.rawText,
      createdAt: analysis.createdAt,
      atsScore: analysis.atsScore,
      feedbackReport: analysis.feedbackReport,
    };
  }

  private async skillNamesForAnalysis(analysisId: string): Promise<{
    present: string[];
    missing: string[];
  }> {
    const rows = await this.analysisSkills
      .createQueryBuilder('link')
      .innerJoinAndSelect('link.skill', 'skill')
      .where('link.resumeAnalysisId = :analysisId', { analysisId })
      .getMany();

    const present: string[] = [];
    const missing: string[] = [];
    for (const row of rows) {
      const name = row.skill.name;
      if (row.status === ResumeAnalysisSkillStatus.PRESENT) {
        present.push(name);
      } else {
        missing.push(name);
      }
    }
    return { present, missing };
  }

  private async acquireUserLock(
    manager: EntityManager,
    userId: string,
  ): Promise<void> {
    await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [userId]);
  }

  private async trimExcessAnalyses(
    manager: EntityManager,
    userId: string,
  ): Promise<string[]> {
    const purgedFileUrls: string[] = [];

    while (true) {
      const count = await manager
        .createQueryBuilder(ResumeAnalysis, 'analysis')
        .innerJoin('analysis.user', 'user')
        .where('user.id = :userId', { userId })
        .getCount();

      if (count < MAX_RESUME_VERSIONS) {
        break;
      }

      const oldest = await manager
        .createQueryBuilder(ResumeAnalysis, 'analysis')
        .innerJoin('analysis.user', 'user')
        .where('user.id = :userId', { userId })
        .orderBy('analysis.createdAt', 'ASC')
        .getOne();

      if (!oldest) {
        break;
      }

      if (oldest.fileUrl) {
        purgedFileUrls.push(oldest.fileUrl);
      }

      await manager.delete(ResumeAnalysis, { id: oldest.id });
    }

    return purgedFileUrls;
  }

  private async findOrCreateSkill(
    manager: EntityManager,
    link: SkillLinkInput,
  ): Promise<Skill> {
    const sanitized = sanitizeSkillName(link.name);
    const normalizedKey = normalizeSkillNameKey(sanitized);
    if (!normalizedKey) {
      throw new Error('Skill name is empty after sanitization');
    }

    const existing = await manager
      .getRepository(Skill)
      .createQueryBuilder('skill')
      .where('lower(btrim(skill.name)) = :normalizedKey', { normalizedKey })
      .getOne();

    if (existing) {
      return existing;
    }

    try {
      const created = manager.create(Skill, {
        id: randomUUID(),
        name: sanitized,
        category: link.category,
      });
      return await manager.save(created);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const raced = await manager
          .getRepository(Skill)
          .createQueryBuilder('skill')
          .where('lower(btrim(skill.name)) = :normalizedKey', {
            normalizedKey,
          })
          .getOne();
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (error instanceof QueryFailedError) {
    const driverError = error.driverError as { code?: string } | undefined;
    if (driverError?.code === UNIQUE_VIOLATION) {
      return true;
    }
  }
  const maybeError = error as {
    code?: string;
    driverError?: { code?: string };
  };
  return (
    maybeError?.code === UNIQUE_VIOLATION ||
    maybeError?.driverError?.code === UNIQUE_VIOLATION
  );
}
