import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import type { User } from '../users/user.entity.js';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import type {
  CreateResumeAnalysisParams,
  ResumeAnalysisRecord,
  ResumesRepository,
} from './resumes.repository.js';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class TypeOrmResumesRepository implements ResumesRepository {
  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly analyses: Repository<ResumeAnalysis>,
  ) {}

  async create(
    params: CreateResumeAnalysisParams,
  ): Promise<ResumeAnalysisRecord> {
    const entity = this.analyses.create({
      id: params.id,
      fileUrl: params.fileUrl,
      rawText: params.rawText,
      atsScore: null,
      feedbackReport: null,
      user: { id: params.userId } as User,
    });

    try {
      const insertResult = await this.analyses.insert(entity as never);
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

      return {
        id: entity.id,
        userId: params.userId,
        fileUrl: entity.fileUrl,
        rawText: entity.rawText,
        createdAt,
      };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'Resume analysis already exists for this submission',
        );
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
