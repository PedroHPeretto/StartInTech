import type {
  ExtractedSkillDto,
  ResumeAnalysisSkillStatus,
  SkillCategory,
} from '@startintech/shared';

export interface CreateResumeAnalysisParams {
  id: string;
  userId: string;
  fileUrl: string | null;
  rawText: string | null;
}

export interface ResumeAnalysisRecord {
  id: string;
  userId: string;
  fileUrl: string | null;
  rawText: string | null;
  createdAt: Date;
}

export interface SkillLinkInput {
  name: string;
  category: SkillCategory;
  status: ResumeAnalysisSkillStatus;
}

export interface PersistedSkillExtraction {
  detected: ExtractedSkillDto[];
  missing: ExtractedSkillDto[];
}

export interface ResumesRepository {
  create(params: CreateResumeAnalysisParams): Promise<ResumeAnalysisRecord>;
  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisRecord | null>;
  persistSkillExtraction(
    resumeAnalysisId: string,
    links: SkillLinkInput[],
  ): Promise<PersistedSkillExtraction>;
}

export const RESUMES_REPOSITORY = Symbol('RESUMES_REPOSITORY');
