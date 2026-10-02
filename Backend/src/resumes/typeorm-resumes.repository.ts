import {
  ResumeAnalysisSkillStatus,
  type ExtractedSkillDto,
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
import { ResumeAnalysisSkill } from './resume-analysis-skill.entity.js';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import {
  normalizeSkillNameKey,
  sanitizeSkillName,
} from './skill-name.util.js';
import { Skill } from './skill.entity.js';
import type {
  CreateResumeAnalysisParams,
  PersistedSkillExtraction,
  ResumeAnalysisRecord,
  ResumesRepository,
  SkillLinkInput,
} from './resumes.repository.js';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class TypeOrmResumesRepository implements ResumesRepository {
  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly analyses: Repository<ResumeAnalysis>,
    @InjectRepository(Skill)
    private readonly skills: Repository<Skill>,
    @InjectRepository(ResumeAnalysisSkill)
    private readonly analysisSkills: Repository<ResumeAnalysisSkill>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    params: CreateResumeAnalysisParams,
  ): Promise<ResumeAnalysisRecord> {
    const saved = await this.analyses.save(
      this.analyses.create({
        id: params.id,
        fileUrl: params.fileUrl,
        rawText: params.rawText,
        atsScore: null,
        feedbackReport: null,
        user: { id: params.userId } as User,
      }),
    );
    return {
      id: saved.id,
      userId: params.userId,
      fileUrl: saved.fileUrl,
      rawText: saved.rawText,
      createdAt: saved.createdAt,
    };
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

    return {
      id: analysis.id,
      userId,
      fileUrl: analysis.fileUrl,
      rawText: analysis.rawText,
      createdAt: analysis.createdAt,
    };
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
