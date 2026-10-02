import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User } from '../users/user.entity.js';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import type {
  CreateResumeAnalysisParams,
  ResumeAnalysisRecord,
  ResumesRepository,
} from './resumes.repository.js';

@Injectable()
export class TypeOrmResumesRepository implements ResumesRepository {
  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly analyses: Repository<ResumeAnalysis>,
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
}
